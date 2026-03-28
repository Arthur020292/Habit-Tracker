import { DEFAULT_HABIT_TIME, HIGHLIGHT_COLORS, ICON_CHOICES } from '$lib/constants';
import type { Habit, HabitBackupPayload, HabitFrequency, Weekday } from '$lib/types';
import { createHabitId, normalizeCustomDays } from './habits';

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function parseHabitTime(time: unknown): string {
	if (typeof time !== 'string') {
		return DEFAULT_HABIT_TIME;
	}

	const [hoursPart, minutesPart] = time.split(':');
	const hours = Number(hoursPart);
	const minutes = Number(minutesPart);

	if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
		return DEFAULT_HABIT_TIME;
	}

	return `${`${hours}`.padStart(2, '0')}:${`${minutes}`.padStart(2, '0')}`;
}

function parseHabitFrequency(value: unknown): HabitFrequency {
	if (!isRecord(value) || typeof value.type !== 'string') {
		return { type: 'daily' };
	}

	if (value.type === 'daily') {
		return { type: 'daily' };
	}

	if (value.type === 'weekdays') {
		return { type: 'weekdays' };
	}

	if (value.type === 'custom' && Array.isArray(value.days)) {
		const days = value.days.filter(
			(day): day is Weekday =>
				typeof day === 'number' && Number.isInteger(day) && day >= 0 && day <= 6
		);
		return {
			type: 'custom',
			days: normalizeCustomDays(days)
		};
	}

	return { type: 'daily' };
}

function normalizeHabit(value: unknown, index: number): Habit {
	const source = isRecord(value) ? value : {};
	const name = typeof source.name === 'string' && source.name.trim() ? source.name.trim() : `Imported habit ${index + 1}`;
	const color =
		typeof source.color === 'string' && source.color.trim() ? source.color.trim() : HIGHLIGHT_COLORS[0];
	const icon = typeof source.icon === 'string' && source.icon.trim() ? source.icon.trim() : ICON_CHOICES[0];

	return {
		id: typeof source.id === 'string' && source.id.trim() ? source.id.trim() : createHabitId(),
		name,
		color,
		icon,
		time: parseHabitTime(source.time),
		frequency: parseHabitFrequency(source.frequency),
		createdAt:
			typeof source.createdAt === 'string' && source.createdAt.trim()
				? source.createdAt
				: new Date().toISOString(),
		completions: isRecord(source.completions)
			? Object.fromEntries(
					Object.entries(source.completions).filter(([, completed]) => completed === true)
				) as Record<string, boolean>
			: {}
	};
}

export function createHabitsBackup(habits: Habit[]): HabitBackupPayload {
	return {
		version: 1,
		exportedAt: new Date().toISOString(),
		habits
	};
}

export function parseHabitsBackup(raw: string): Habit[] | null {
	try {
		const parsed: unknown = JSON.parse(raw);

		const habits = Array.isArray(parsed)
			? parsed
			: isRecord(parsed) && Array.isArray(parsed.habits)
				? parsed.habits
				: null;

		if (!habits) {
			return null;
		}

		return habits.map((habit, index) => normalizeHabit(habit, index));
	} catch {
		return null;
	}
}

export function downloadJsonFile(filename: string, value: unknown): void {
	const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');

	anchor.href = url;
	anchor.download = filename;
	anchor.click();

	URL.revokeObjectURL(url);
}
