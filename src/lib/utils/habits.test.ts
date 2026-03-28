import { describe, expect, it } from 'vitest';
import type { Habit } from '$lib/types';
import { toDateKey } from './date';
import {
	getAvailableHabitTimeFilters,
	getHabitStatsInRange,
	getTodaySummary
} from './habits';

function createHabit(overrides: Partial<Habit> = {}): Habit {
	return {
		id: 'habit-1',
		name: 'Drink water',
		color: '#4f8f6c',
		icon: '💧',
		time: '08:00',
		frequency: { type: 'daily' },
		createdAt: '2026-03-01T00:00:00',
		completions: {},
		...overrides
	};
}

describe('habit helpers', () => {
	it('computes today summary from only scheduled habits', () => {
		const date = new Date(2026, 2, 30);
		const dateKey = toDateKey(date);
		const habits = [
			createHabit({
				id: 'daily',
				completions: { [dateKey]: true }
			}),
			createHabit({
				id: 'weekdays',
				frequency: { type: 'weekdays' },
				completions: {}
			})
		];

		const summary = getTodaySummary(habits, date);

		expect(summary).toEqual({
			completed: 1,
			total: 2,
			percentage: 50,
			allComplete: false
		});
	});

	it('computes streak and completion stats for a range', () => {
		const habit = createHabit({
			completions: {
				[toDateKey(new Date(2026, 2, 28))]: true,
				[toDateKey(new Date(2026, 2, 29))]: true,
				[toDateKey(new Date(2026, 2, 30))]: true
			}
		});

		const stats = getHabitStatsInRange(habit, new Date(2026, 2, 28), new Date(2026, 2, 30));

		expect(stats).toEqual({
			currentStreak: 3,
			bestStreak: 3,
			completionRate: 100,
			scheduledDays: 3,
			completedDays: 3
		});
	});

	it('returns only the time filters that are actually present', () => {
		const filters = getAvailableHabitTimeFilters([
			createHabit({ id: 'morning', time: '08:00' }),
			createHabit({ id: 'evening', time: '18:30' })
		]);

		expect(filters).toEqual([
			{ value: 'all', label: 'All' },
			{ value: 'morning', label: 'Morning' },
			{ value: 'evening', label: 'Evening' }
		]);
	});
});
