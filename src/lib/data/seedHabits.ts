import { addDays, toDateKey, isWeekdayAllowed } from '$lib/utils/date';
import type { Habit, HabitFrequency, Weekday } from '$lib/types';

function startOfDay(reference = new Date()): Date {
	const date = new Date(reference);
	date.setHours(0, 0, 0, 0);
	return date;
}

function hashString(input: string): number {
	let hash = 0;

	for (let index = 0; index < input.length; index += 1) {
		hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
	}

	return hash;
}

function isScheduledForSeedDate(frequency: HabitFrequency, date: Date): boolean {
	if (frequency.type === 'daily') {
		return true;
	}

	const day = date.getDay() as Weekday;
	if (frequency.type === 'weekdays') {
		return day >= 1 && day <= 5;
	}

	return isWeekdayAllowed(day, frequency.days);
}

function createCompletionMap(options: {
	reference: Date;
	createdAtDaysAgo: number;
	frequency: HabitFrequency;
	seed: string;
	completionRate: number;
	recentConsistencyDays: number;
}): Record<string, boolean> {
	const today = startOfDay(options.reference);
	const completions: Record<string, boolean> = {};

	for (let offset = options.createdAtDaysAgo; offset >= 0; offset -= 1) {
		const date = addDays(today, -offset);

		if (!isScheduledForSeedDate(options.frequency, date)) {
			continue;
		}

		if (offset < options.recentConsistencyDays) {
			completions[toDateKey(date)] = true;
			continue;
		}

		const score = hashString(`${options.seed}:${toDateKey(date)}`) % 100;
		completions[toDateKey(date)] = score < options.completionRate;
	}

	return completions;
}

function createSeedHabit(
	reference: Date,
	habit: Omit<Habit, 'id' | 'createdAt' | 'completions'> & {
		createdAtDaysAgo: number;
		completionRate: number;
		recentConsistencyDays: number;
	}
): Habit {
	return {
		id: `seed_${habit.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
		name: habit.name,
		color: habit.color,
		icon: habit.icon,
		time: habit.time,
		frequency: habit.frequency,
		createdAt: addDays(startOfDay(reference), -habit.createdAtDaysAgo).toISOString(),
		completions: createCompletionMap({
			reference,
			createdAtDaysAgo: habit.createdAtDaysAgo,
			frequency: habit.frequency,
			seed: habit.name,
			completionRate: habit.completionRate,
			recentConsistencyDays: habit.recentConsistencyDays
		})
	};
}

export function createSeedHabits(reference = new Date()): Habit[] {
	return [
		createSeedHabit(reference, {
			name: 'Drink water',
			color: '#4f8f6c',
			icon: '💧',
			time: '07:00',
			frequency: { type: 'daily' },
			createdAtDaysAgo: 120,
			completionRate: 88,
			recentConsistencyDays: 5
		}),
		createSeedHabit(reference, {
			name: 'Morning stretch',
			color: '#6ca67c',
			icon: '🧘',
			time: '08:00',
			frequency: { type: 'weekdays' },
			createdAtDaysAgo: 117,
			completionRate: 82,
			recentConsistencyDays: 4
		}),
		createSeedHabit(reference, {
			name: 'Meditate',
			color: '#7fba8f',
			icon: '☀️',
			time: '06:30',
			frequency: { type: 'daily' },
			createdAtDaysAgo: 114,
			completionRate: 76,
			recentConsistencyDays: 3
		}),
		createSeedHabit(reference, {
			name: 'Read 20 pages',
			color: '#8b9bb7',
			icon: '📚',
			time: '21:00',
			frequency: { type: 'daily' },
			createdAtDaysAgo: 111,
			completionRate: 71,
			recentConsistencyDays: 3
		}),
		createSeedHabit(reference, {
			name: 'Walk 8,000 steps',
			color: '#93c5aa',
			icon: '🏃',
			time: '18:30',
			frequency: { type: 'daily' },
			createdAtDaysAgo: 108,
			completionRate: 79,
			recentConsistencyDays: 4
		}),
		createSeedHabit(reference, {
			name: 'Journal three lines',
			color: '#d77a61',
			icon: '✍️',
			time: '20:30',
			frequency: { type: 'custom', days: [2, 4, 6] as Weekday[] },
			createdAtDaysAgo: 105,
			completionRate: 67,
			recentConsistencyDays: 2
		}),
		createSeedHabit(reference, {
			name: 'Tidy workspace',
			color: '#c28f72',
			icon: '🫶',
			time: '17:30',
			frequency: { type: 'weekdays' },
			createdAtDaysAgo: 102,
			completionRate: 74,
			recentConsistencyDays: 3
		}),
		createSeedHabit(reference, {
			name: 'Review spending',
			color: '#6f7d6e',
			icon: '🍵',
			time: '19:45',
			frequency: { type: 'custom', days: [0, 6] as Weekday[] },
			createdAtDaysAgo: 99,
			completionRate: 63,
			recentConsistencyDays: 2
		})
	];
}
