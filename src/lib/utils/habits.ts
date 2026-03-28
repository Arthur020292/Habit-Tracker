import type {
	Habit,
	HabitFrequency,
	HabitStats,
	StatsRange,
	TodaySummary,
	WeeklyDayProgress,
	Weekday
} from '$lib/types';
import { addDays, eachDateBetween, fromDateKey, isWeekdayAllowed, startOfWeek, toDateKey } from './date';

export type HabitTimeFilter = 'all' | 'morning' | 'afternoon' | 'evening';

export interface HabitTimeFilterOption {
	value: HabitTimeFilter;
	label: string;
}

const habitStatsCache = new WeakMap<Habit, Map<string, HabitStats>>();
const todaySummaryCache = new WeakMap<Habit[], Map<string, TodaySummary>>();
const dateRangeProgressCache = new WeakMap<Habit[], Map<string, WeeklyDayProgress[]>>();
const weekdayBreakdownCache = new WeakMap<Habit[], Map<string, WeeklyDayProgress[]>>();

export function isHabitScheduledForDate(habit: Habit, date: Date): boolean {
	const createdAt = fromDateKey(toDateKey(new Date(habit.createdAt)));
	const currentDay = fromDateKey(toDateKey(date));
	if (currentDay < createdAt) {
		return false;
	}

	if (habit.frequency.type === 'daily') {
		return true;
	}

	const day = date.getDay() as Weekday;
	if (habit.frequency.type === 'weekdays') {
		return day >= 1 && day <= 5;
	}

	return isWeekdayAllowed(day, habit.frequency.days);
}

export function isHabitCompleteForDate(habit: Habit, dateKey: string): boolean {
	return habit.completions[dateKey] === true;
}

export function setHabitCompletion(habit: Habit, dateKey: string, completed: boolean): Habit {
	return {
		...habit,
		completions: {
			...habit.completions,
			[dateKey]: completed
		}
	};
}

export function formatHabitTime(time: string): string {
	if (!time) {
		return '';
	}

	const [hoursPart, minutesPart] = time.split(':');
	const hours = Number(hoursPart);
	const minutes = Number(minutesPart);

	if (Number.isNaN(hours) || Number.isNaN(minutes)) {
		return time;
	}

	const date = new Date();
	date.setHours(hours, minutes, 0, 0);

	return new Intl.DateTimeFormat('en-US', {
		hour: 'numeric',
		minute: '2-digit'
	}).format(date);
}

export function compareHabitsByTime(a: Habit, b: Habit): number {
	const aMinutes = parseHabitTimeToMinutes(a.time);
	const bMinutes = parseHabitTimeToMinutes(b.time);

	if (aMinutes !== bMinutes) {
		return aMinutes - bMinutes;
	}

	return a.name.localeCompare(b.name);
}

export function sortHabitsByTime(habits: Habit[]): Habit[] {
	return [...habits].sort(compareHabitsByTime);
}

export function getHabitTimeFilter(time: string): Exclude<HabitTimeFilter, 'all'> {
	const minutes = parseHabitTimeToMinutes(time);

	if (minutes < 12 * 60) {
		return 'morning';
	}

	if (minutes < 17 * 60) {
		return 'afternoon';
	}

	return 'evening';
}

export function getHabitTimeFilterLabel(filter: HabitTimeFilter): string {
	switch (filter) {
		case 'all':
			return 'All';
		case 'morning':
			return 'Morning';
		case 'afternoon':
			return 'Afternoon';
		case 'evening':
			return 'Evening';
	}
}

export function getWeekStartLabel(weekStart: Weekday): string {
	return weekStart === 1 ? 'Monday start' : 'Sunday start';
}

export function getAvailableHabitTimeFilters(habits: Habit[]): HabitTimeFilterOption[] {
	const presentRanges = new Set<Exclude<HabitTimeFilter, 'all'>>();

	for (const habit of habits) {
		presentRanges.add(getHabitTimeFilter(habit.time));
	}

	if (presentRanges.size < 2) {
		return [];
	}

	const orderedRanges: Exclude<HabitTimeFilter, 'all'>[] = ['morning', 'afternoon', 'evening'];

	return [
		{ value: 'all', label: getHabitTimeFilterLabel('all') },
		...orderedRanges
			.filter((range) => presentRanges.has(range))
			.map((range) => ({
				value: range,
				label: getHabitTimeFilterLabel(range)
			}))
	];
}

export function filterHabitsByTimeFilter(habits: Habit[], filter: HabitTimeFilter): Habit[] {
	if (filter === 'all') {
		return habits;
	}

	return habits.filter((habit) => getHabitTimeFilter(habit.time) === filter);
}

function countEligibleAndCompletedForDate(habits: Habit[], date: Date): { eligible: number; completed: number } {
	const dateKey = toDateKey(date);
	let eligible = 0;
	let completed = 0;

	for (const habit of habits) {
		if (!isHabitScheduledForDate(habit, date)) {
			continue;
		}

		eligible += 1;
		if (habit.completions[dateKey] === true) {
			completed += 1;
		}
	}

	return { eligible, completed };
}

function getCachedValue<K extends object, V>(
	cache: WeakMap<K, Map<string, V>>,
	key: K,
	cacheKey: string,
	compute: () => V
): V {
	const cacheBucket = cache.get(key);
	if (cacheBucket?.has(cacheKey)) {
		return cacheBucket.get(cacheKey) as V;
	}

	const nextValue = compute();
	if (cacheBucket) {
		cacheBucket.set(cacheKey, nextValue);
	} else {
		cache.set(key, new Map([[cacheKey, nextValue]]));
	}

	return nextValue;
}

function parseHabitTimeToMinutes(time: string): number {
	const [hoursPart, minutesPart] = time.split(':');
	const hours = Number(hoursPart);
	const minutes = Number(minutesPart);

	if (Number.isNaN(hours) || Number.isNaN(minutes)) {
		return 8 * 60;
	}

	return hours * 60 + minutes;
}

function getEffectiveStartDate(habit: Habit, startDate: Date): Date {
	const createdAt = fromDateKey(toDateKey(new Date(habit.createdAt)));
	const normalizedStart = fromDateKey(toDateKey(startDate));
	return normalizedStart < createdAt ? createdAt : normalizedStart;
}

function getScheduledDatesBetween(habit: Habit, startDate: Date, endDate = new Date()): Date[] {
	const effectiveStart = getEffectiveStartDate(habit, startDate);
	return eachDateBetween(effectiveStart, endDate).filter((date) => isHabitScheduledForDate(habit, date));
}

export function getHabitStats(habit: Habit, endDate = new Date()): HabitStats {
	return getHabitStatsInRange(habit, new Date(habit.createdAt), endDate);
}

export function getHabitStatsInRange(habit: Habit, startDate: Date, endDate = new Date()): HabitStats {
	const cacheKey = `${toDateKey(startDate)}|${toDateKey(endDate)}`;

	return getCachedValue(habitStatsCache, habit, cacheKey, () => {
		const scheduledDates = getScheduledDatesBetween(habit, startDate, endDate);
		let bestStreak = 0;
		let runningStreak = 0;
		let currentStreak = 0;
		let currentStreakLocked = false;
		let completedDays = 0;

		for (let index = scheduledDates.length - 1; index >= 0; index -= 1) {
			const key = toDateKey(scheduledDates[index]);
			const completed = habit.completions[key] === true;

			if (completed) {
				completedDays += 1;
				runningStreak += 1;
				bestStreak = Math.max(bestStreak, runningStreak);
				if (!currentStreakLocked) {
					currentStreak += 1;
				}
			} else {
				if (!currentStreakLocked) {
					currentStreakLocked = true;
				}
				runningStreak = 0;
			}
		}

		if (!currentStreakLocked) {
			currentStreak = runningStreak;
		}

		const scheduledDays = scheduledDates.length;
		const completionRate = scheduledDays === 0 ? 0 : Math.round((completedDays / scheduledDays) * 100);

		return {
			currentStreak,
			bestStreak,
			completionRate,
			scheduledDays,
			completedDays
		};
	});
}

export function getEarliestHabitCreatedAt(habits: Habit[], fallback = new Date()): Date {
	let earliest: Date | null = null;

	for (const habit of habits) {
		const createdAt = fromDateKey(toDateKey(new Date(habit.createdAt)));
		if (!earliest || createdAt < earliest) {
			earliest = createdAt;
		}
	}

	return earliest ?? fromDateKey(toDateKey(fallback));
}

export function getStatsRangeStartDate(
	habits: Habit[],
	range: StatsRange,
	endDate = new Date(),
	weekStart: Weekday = 0
): Date {
	if (range === 'week') {
		return startOfWeek(endDate, weekStart);
	}

	if (range === 'month') {
		return addDays(fromDateKey(toDateKey(endDate)), -29);
	}

	return getEarliestHabitCreatedAt(habits, endDate);
}

export function getTodaySummary(habits: Habit[], date = new Date()): TodaySummary {
	return getCachedValue(todaySummaryCache, habits, toDateKey(date), () => {
		const { eligible: total, completed } = countEligibleAndCompletedForDate(habits, date);
		const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

		return {
			completed,
			total,
			percentage,
			allComplete: total > 0 && completed === total
		};
	});
}

export function getDateRangeProgress(
	habits: Habit[],
	startDate: Date,
	endDate = new Date()
): WeeklyDayProgress[] {
	const cacheKey = `${toDateKey(startDate)}|${toDateKey(endDate)}`;

	return getCachedValue(dateRangeProgressCache, habits, cacheKey, () => {
		const window = eachDateBetween(startDate, endDate);

		return window.map((date) => {
			const { eligible, completed } = countEligibleAndCompletedForDate(habits, date);

			return {
				dateKey: toDateKey(date),
				label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
				shortLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
				completed,
				eligible,
				percentage: eligible === 0 ? 0 : Math.round((completed / eligible) * 100)
			};
		});
	});
}

export function getWeeklyProgress(
	habits: Habit[],
	endDate = new Date(),
	weekStart: Weekday = 0
): WeeklyDayProgress[] {
	const start = startOfWeek(endDate, weekStart);
	const days = eachDateBetween(start, addDays(start, 6));

	return getDateRangeProgress(habits, days[0] ?? start, days[days.length - 1] ?? endDate);
}

export function getTrailingProgress(
	habits: Habit[],
	endDate = new Date(),
	days = 30
): WeeklyDayProgress[] {
	const duration = Math.max(1, days);
	const start = addDays(fromDateKey(toDateKey(endDate)), -(duration - 1));
	return getDateRangeProgress(habits, start, endDate);
}

export function getWeekdayBreakdown(
	habits: Habit[],
	startDate: Date,
	endDate = new Date()
): WeeklyDayProgress[] {
	const cacheKey = `${toDateKey(startDate)}|${toDateKey(endDate)}`;

	return getCachedValue(weekdayBreakdownCache, habits, cacheKey, () => {
		const totals = Array.from({ length: 7 }, (_, index) => ({
			dateKey: `${index}`,
			label: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index],
			shortLabel: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index],
			completed: 0,
			eligible: 0,
			percentage: 0
		}));

		for (const date of eachDateBetween(startDate, endDate)) {
			const day = date.getDay();
			for (const habit of habits) {
				if (!isHabitScheduledForDate(habit, date)) {
					continue;
				}

				totals[day].eligible += 1;
				if (habit.completions[toDateKey(date)] === true) {
					totals[day].completed += 1;
				}
			}
		}

		return totals.map((day) => ({
			...day,
			percentage: day.eligible === 0 ? 0 : Math.round((day.completed / day.eligible) * 100)
		}));
	});
}

export function getOverallCompletionRate(habits: Habit[], date = new Date()): number {
	let totalEligible = 0;
	let totalCompleted = 0;

	for (const habit of habits) {
		const scheduledDates = getScheduledDatesBetween(habit, new Date(habit.createdAt), date);
		totalEligible += scheduledDates.length;
		totalCompleted += scheduledDates.filter((scheduledDate) => habit.completions[toDateKey(scheduledDate)] === true).length;
	}

	if (totalEligible === 0) {
		return 0;
	}

	return Math.round((totalCompleted / totalEligible) * 100);
}

export function createHabitId(): string {
	return `habit_${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeCustomDays(days: Weekday[]): Weekday[] {
	return Array.from(new Set(days)).sort((a, b) => a - b) as Weekday[];
}

export function frequencyLabel(frequency: HabitFrequency): string {
	if (frequency.type === 'daily') {
		return 'Daily';
	}

	if (frequency.type === 'weekdays') {
		return 'Weekdays';
	}

	const labels = frequency.days
		.slice()
		.sort((a, b) => a - b)
		.map((day) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]);

	return labels.join(', ');
}
