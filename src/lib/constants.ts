import type { AppSettings, HabitFormValues, Weekday } from './types';

export const STORAGE_KEY = 'habit-tracker:v1';
export const SEEDED_HABITS_KEY = 'habit-tracker:seeded-habits';
export const SEEDED_HABITS_VERSION_KEY = 'habit-tracker:seeded-habits-version';
export const SEEDED_HABITS_VERSION = 2;
export const THEME_KEY = 'habit-tracker:theme';
export const SETTINGS_KEY = 'habit-tracker:settings';
export const DEFAULT_HABIT_TIME = '08:00';

export const WEEKDAY_LABELS: Array<{ short: string; long: string; day: Weekday }> = [
	{ short: 'Su', long: 'Sunday', day: 0 },
	{ short: 'Mo', long: 'Monday', day: 1 },
	{ short: 'Tu', long: 'Tuesday', day: 2 },
	{ short: 'We', long: 'Wednesday', day: 3 },
	{ short: 'Th', long: 'Thursday', day: 4 },
	{ short: 'Fr', long: 'Friday', day: 5 },
	{ short: 'Sa', long: 'Saturday', day: 6 }
];

export const HIGHLIGHT_COLORS = [
	'#4f8f6c',
	'#6ca67c',
	'#7fba8f',
	'#93c5aa',
	'#d77a61',
	'#8b9bb7',
	'#c28f72',
	'#6f7d6e'
];

export const ICON_CHOICES = ['🌿', '☀️', '💧', '🧘', '📚', '🏃', '✍️', '🫶', '🍵', '🎧'];

export const DEFAULT_HABIT_FORM: HabitFormValues = {
	name: '',
	color: HIGHLIGHT_COLORS[0],
	icon: '🌿',
	time: DEFAULT_HABIT_TIME,
	frequency: { type: 'daily' }
};

export const DEFAULT_SETTINGS: AppSettings = {
	weekStart: 0,
	reminders: {
		enabled: false,
		time: '09:00',
		cadence: 'daily'
	}
};
