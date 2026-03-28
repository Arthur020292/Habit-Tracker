import { describe, expect, it } from 'vitest';
import {
	MAX_BACKUP_FILE_BYTES,
	MAX_BACKUP_HABITS,
	parseHabitsBackup
} from './backup';
import { toDateKey } from './date';

describe('backup parser', () => {
	it('restores a valid backup payload and normalizes its data', () => {
		const habits = parseHabitsBackup(
			JSON.stringify({
				version: 1,
				exportedAt: '2026-03-28T00:00:00.000Z',
				habits: [
					{
						id: 'imported-1',
						name: 'Morning walk',
						color: '#4f8f6c',
						icon: '🏃',
						time: '7:15',
						frequency: { type: 'custom', days: [1, 3, 5] },
						createdAt: '2026-03-01T00:00:00',
						completions: {
							[toDateKey(new Date(2026, 2, 28))]: true
						}
					}
				]
			})
		);

		expect(habits).toEqual([
			{
				id: 'imported-1',
				name: 'Morning walk',
				color: '#4f8f6c',
				icon: '🏃',
				time: '07:15',
				frequency: { type: 'custom', days: [1, 3, 5] },
				createdAt: '2026-03-01T00:00:00',
				completions: {
					[toDateKey(new Date(2026, 2, 28))]: true
				}
			}
		]);
	});

	it('rejects oversized files before parsing', () => {
		expect(parseHabitsBackup('x'.repeat(MAX_BACKUP_FILE_BYTES + 1))).toBeNull();
	});

	it('rejects backups with too many habits', () => {
		const backup = {
			version: 1,
			exportedAt: '2026-03-28T00:00:00.000Z',
			habits: Array.from({ length: MAX_BACKUP_HABITS + 1 }, (_, index) => ({
				name: `Habit ${index + 1}`
			}))
		};

		expect(parseHabitsBackup(JSON.stringify(backup))).toBeNull();
	});

	it('rejects unsupported backup versions and invalid completion keys', () => {
		expect(
			parseHabitsBackup(
				JSON.stringify({
					version: 2,
					exportedAt: '2026-03-28T00:00:00.000Z',
					habits: []
				})
			)
		).toBeNull();

		expect(
			parseHabitsBackup(
				JSON.stringify({
					version: 1,
					exportedAt: '2026-03-28T00:00:00.000Z',
					habits: [
						{
							name: 'Bad backup',
							completions: { definitely_not_a_date: true }
						}
					]
				})
			)
		).toBeNull();
	});
});
