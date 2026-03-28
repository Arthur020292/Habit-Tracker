import type { Weekday } from '$lib/types';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
	weekday: 'long',
	month: 'long',
	day: 'numeric'
});

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric'
});

const WEEKDAY_SHORT_FORMATTER = new Intl.DateTimeFormat('en-US', {
	weekday: 'short'
});

export function toDateKey(date: Date): string {
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, '0');
	const day = `${date.getDate()}`.padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function fromDateKey(dateKey: string): Date {
	const [year, month, day] = dateKey.split('-').map(Number);
	return new Date(year, month - 1, day);
}

export function todayKey(reference = new Date()): string {
	return toDateKey(reference);
}

export function formatTodayLabel(date = new Date()): string {
	return DATE_FORMATTER.format(date);
}

export function formatShortDate(date = new Date()): string {
	return SHORT_DATE_FORMATTER.format(date);
}

export function formatWeekdayShort(date = new Date()): string {
	return WEEKDAY_SHORT_FORMATTER.format(date);
}

export function addDays(date: Date, amount: number): Date {
	const next = new Date(date);
	next.setDate(next.getDate() + amount);
	return next;
}

export function startOfWeek(date: Date, weekStart: Weekday): Date {
	const start = new Date(date);
	start.setHours(0, 0, 0, 0);
	const currentDay = start.getDay() as Weekday;
	const offset = (currentDay - weekStart + 7) % 7;
	start.setDate(start.getDate() - offset);
	return start;
}

export function eachDateBetween(start: Date, end: Date): Date[] {
	const dates: Date[] = [];
	let cursor = new Date(start);
	cursor.setHours(0, 0, 0, 0);
	const last = new Date(end);
	last.setHours(0, 0, 0, 0);

	while (cursor <= last) {
		dates.push(new Date(cursor));
		cursor = addDays(cursor, 1);
	}

	return dates;
}

export function isWeekdayAllowed(day: number, allowedDays: Weekday[]): boolean {
	return allowedDays.includes(day as Weekday);
}
