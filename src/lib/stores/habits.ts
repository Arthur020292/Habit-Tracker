import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import {
	DEFAULT_HABIT_TIME,
	SEEDED_HABITS_KEY,
	SEEDED_HABITS_VERSION,
	SEEDED_HABITS_VERSION_KEY,
	STORAGE_KEY
} from '$lib/constants';
import { createSeedHabits } from '$lib/data/seedHabits';
import type { Habit, HabitFormValues, Weekday } from '$lib/types';
import { createHabitId, normalizeCustomDays, setHabitCompletion } from '$lib/utils/habits';
import { readJson, removeItem, writeJson } from '$lib/utils/storage';
import { storageNotice } from './storageNotice';

function loadHabits(): Habit[] {
	return readJson<Habit[]>(STORAGE_KEY, []).map((habit) => ({
		...habit,
		time: habit.time ?? DEFAULT_HABIT_TIME
	}));
}

function normalizeHabits(nextHabits: Habit[]): Habit[] {
	return nextHabits.map((habit) => ({
		...habit,
		time: habit.time ?? DEFAULT_HABIT_TIME
	}));
}

function persistHabits(habits: Habit[]): void {
	const habitsSaved = writeJson(STORAGE_KEY, habits);
	const seededSaved = writeJson(SEEDED_HABITS_KEY, true);
	const versionSaved = writeJson(SEEDED_HABITS_VERSION_KEY, SEEDED_HABITS_VERSION);

	if (habitsSaved && seededSaved && versionSaved) {
		storageNotice.clear();
		return;
	}

	storageNotice.report('Habit changes could not be saved because the browser storage is full or blocked.');
}

function hasSeededDefaultHabits(): boolean {
	return readJson<boolean>(SEEDED_HABITS_KEY, false);
}

function hasCurrentSeedVersion(): boolean {
	return readJson<number>(SEEDED_HABITS_VERSION_KEY, 0) >= SEEDED_HABITS_VERSION;
}

function isDemoSeedHabit(habit: Habit): boolean {
	return habit.id.startsWith('seed_');
}

function loadInitialHabits(): Habit[] {
	const saved = loadHabits();

	if (saved.length > 0) {
		if (!hasCurrentSeedVersion() && saved.every(isDemoSeedHabit)) {
			const seedHabits = createSeedHabits();
			persistHabits(seedHabits);
			return seedHabits;
		}

		return saved;
	}

	if (!hasSeededDefaultHabits()) {
		const seedHabits = createSeedHabits();
		persistHabits(seedHabits);
		return seedHabits;
	}

	return saved;
}

function normalizeFrequency(values: HabitFormValues['frequency']): Habit['frequency'] {
	return values.type === 'custom'
		? { type: 'custom', days: normalizeCustomDays(values.days) }
		: values;
}

function createHabitStore() {
	const { subscribe, set, update } = writable<Habit[]>([]);
	let initialized = false;

	if (browser) {
		set(loadInitialHabits());
		initialized = true;
	}

	return {
		subscribe,
		init() {
			if (!browser) {
				return;
			}

			set(loadInitialHabits());
			initialized = true;
		},
		add(values: HabitFormValues) {
			const habit: Habit = {
				id: createHabitId(),
				name: values.name.trim(),
				color: values.color,
				icon: values.icon.trim(),
				time: values.time || DEFAULT_HABIT_TIME,
				frequency: normalizeFrequency(values.frequency),
				createdAt: new Date().toISOString(),
				completions: {}
			};

			update((habits) => {
				const next = [habit, ...habits];
				if (initialized) {
					persistHabits(next);
				}
				return next;
			});
		},
		updateHabit(id: string, values: HabitFormValues) {
			update((habits) => {
				const next = habits.map((habit) => {
					if (habit.id !== id) {
						return habit;
					}

					return {
						...habit,
						name: values.name.trim(),
						color: values.color,
						icon: values.icon.trim(),
						time: values.time || DEFAULT_HABIT_TIME,
						frequency: normalizeFrequency(values.frequency)
					};
				});

				if (initialized) {
					persistHabits(next);
				}
				return next;
			});
		},
		deleteHabit(id: string) {
			update((habits) => {
				const next = habits.filter((habit) => habit.id !== id);
				if (initialized) {
					persistHabits(next);
				}
				return next;
			});
		},
		setCompletion(id: string, dateKey: string, completed: boolean) {
			update((habits) => {
				const next = habits.map((habit) => {
					if (habit.id !== id) {
						return habit;
					}

					return setHabitCompletion(habit, dateKey, completed);
				});

				if (initialized) {
					persistHabits(next);
				}
				return next;
			});
		},
		toggleCompletion(id: string, dateKey: string) {
			update((habits) => {
				const next = habits.map((habit) => {
					if (habit.id !== id) {
						return habit;
					}

					const nextValue = habit.completions[dateKey] !== true;
					return setHabitCompletion(habit, dateKey, nextValue);
				});

				if (initialized) {
					persistHabits(next);
				}
				return next;
			});
		},
		replaceAll(nextHabits: Habit[]) {
			const normalized = normalizeHabits(nextHabits);
			set(normalized);
			if (initialized) {
				persistHabits(normalized);
			}
		},
			clear() {
				set([]);
				if (removeItem(STORAGE_KEY)) {
					storageNotice.clear();
					return;
				}

				storageNotice.report('Habit data could not be removed because the browser storage is blocked.');
			}
		};
	}

export const habits = createHabitStore();
