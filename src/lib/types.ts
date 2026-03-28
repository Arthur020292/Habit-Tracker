export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type WeekStartDay = 0 | 1;
export type ReminderCadence = 'daily' | 'weekdays';
export type StatsRange = 'total' | 'month' | 'week';

export type HabitFrequency =
	| {
			type: 'daily';
	  }
	| {
			type: 'weekdays';
	  }
	| {
			type: 'custom';
			days: Weekday[];
	  };

export interface Habit {
	id: string;
	name: string;
	color: string;
	icon: string;
	time: string;
	frequency: HabitFrequency;
	createdAt: string;
	completions: Record<string, boolean>;
}

export interface HabitFormValues {
	name: string;
	color: string;
	icon: string;
	time: string;
	frequency: HabitFrequency;
}

export interface ReminderPreferences {
	enabled: boolean;
	time: string;
	cadence: ReminderCadence;
}

export interface AppSettings {
	weekStart: WeekStartDay;
	reminders: ReminderPreferences;
}

export interface HabitBackupPayload {
	version: 1;
	exportedAt: string;
	habits: Habit[];
}

export interface HabitStats {
	currentStreak: number;
	bestStreak: number;
	completionRate: number;
	scheduledDays: number;
	completedDays: number;
}

export interface TodaySummary {
	completed: number;
	total: number;
	percentage: number;
	allComplete: boolean;
}

export interface WeeklyDayProgress {
	dateKey: string;
	label: string;
	shortLabel: string;
	completed: number;
	eligible: number;
	percentage: number;
}
