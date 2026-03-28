import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { THEME_KEY } from '$lib/constants';
import { readJson, writeJson } from '$lib/utils/storage';
import { removeItem } from '$lib/utils/storage';

export type ThemeMode = 'light' | 'dark';

function resolveTheme(): ThemeMode {
	return readJson<ThemeMode>(THEME_KEY, 'light');
}

function applyTheme(theme: ThemeMode): void {
	if (!browser) {
		return;
	}

	document.documentElement.classList.toggle('dark', theme === 'dark');
	writeJson(THEME_KEY, theme);
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
			removeItem(THEME_KEY);
			set('light');
		}
	};
}

export const theme = createThemeStore();
