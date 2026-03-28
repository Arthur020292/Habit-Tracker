import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { DEFAULT_SETTINGS, SETTINGS_KEY } from '$lib/constants';
import type { AppSettings, ReminderCadence, WeekStartDay } from '$lib/types';
import { readJson, removeItem, writeJson } from '$lib/utils/storage';

function loadSettings(): AppSettings {
	const saved = readJson<Partial<AppSettings>>(SETTINGS_KEY, {});

	return {
		weekStart: saved.weekStart === 1 ? 1 : DEFAULT_SETTINGS.weekStart,
		reminders: {
			enabled: saved.reminders?.enabled ?? DEFAULT_SETTINGS.reminders.enabled,
			time: saved.reminders?.time ?? DEFAULT_SETTINGS.reminders.time,
			cadence:
				saved.reminders?.cadence === 'weekdays' ? 'weekdays' : DEFAULT_SETTINGS.reminders.cadence
		}
	};
}

function persistSettings(settings: AppSettings): void {
	writeJson(SETTINGS_KEY, settings);
}

function createSettingsStore() {
	const { subscribe, set, update } = writable<AppSettings>(DEFAULT_SETTINGS);
	let initialized = false;

	if (browser) {
		const saved = loadSettings();
		set(saved);
		initialized = true;
	}

	return {
		subscribe,
		init() {
			if (!browser) {
				return;
			}

			const saved = loadSettings();
			set(saved);
			initialized = true;
		},
		setWeekStart(weekStart: WeekStartDay) {
			update((current) => {
				const next = {
					...current,
					weekStart
				};

				if (initialized) {
					persistSettings(next);
				}

				return next;
			});
		},
		setReminderEnabled(enabled: boolean) {
			update((current) => {
				const next = {
					...current,
					reminders: {
						...current.reminders,
						enabled
					}
				};

				if (initialized) {
					persistSettings(next);
				}

				return next;
			});
		},
		setReminderTime(time: string) {
			update((current) => {
				const next = {
					...current,
					reminders: {
						...current.reminders,
						time
					}
				};

				if (initialized) {
					persistSettings(next);
				}

				return next;
			});
		},
		setReminderCadence(cadence: ReminderCadence) {
			update((current) => {
				const next = {
					...current,
					reminders: {
						...current.reminders,
						cadence
					}
				};

				if (initialized) {
					persistSettings(next);
				}

				return next;
			});
		},
		reset() {
			set(DEFAULT_SETTINGS);
			removeItem(SETTINGS_KEY);
		}
	};
}

export const settings = createSettingsStore();
