import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { THEME_KEY } from '$lib/constants';
import { readJson, writeJson } from '$lib/utils/storage';
import { removeItem } from '$lib/utils/storage';
import { storageNotice } from './storageNotice';

export type ThemeMode = 'light' | 'dark';

function resolveTheme(): ThemeMode {
	return readJson<ThemeMode>(THEME_KEY, 'light');
}

function applyTheme(theme: ThemeMode): void {
	if (!browser) {
		return;
	}

	document.documentElement.classList.toggle('dark', theme === 'dark');
	if (writeJson(THEME_KEY, theme)) {
		storageNotice.clear();
		return;
	}

	storageNotice.report('Theme changes could not be saved because the browser storage is full or blocked.');
}

function createThemeStore() {
	const { subscribe, set, update } = writable<ThemeMode>('light');

	return {
		subscribe,
		init() {
			const theme = resolveTheme();
			set(theme);
			applyTheme(theme);
		},
		toggle() {
			update((theme) => {
				const next = theme === 'light' ? 'dark' : 'light';
				applyTheme(next);
				return next;
			});
		},
		set(theme: ThemeMode) {
			applyTheme(theme);
			set(theme);
		},
			clear() {
				if (!browser) {
					return;
				}

				document.documentElement.classList.remove('dark');
				if (removeItem(THEME_KEY)) {
					storageNotice.clear();
					set('light');
					return;
				}

				storageNotice.report('Theme data could not be cleared because the browser storage is blocked.');
				set('light');
			}
		};
	}

export const theme = createThemeStore();
