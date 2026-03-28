import { browser } from '$app/environment';

export function readJson<T>(key: string, fallback: T): T {
	if (!browser) {
		return fallback;
	}

	try {
		const raw = localStorage.getItem(key);
		if (!raw) {
			return fallback;
		}
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

export function writeJson<T>(key: string, value: T): void {
	if (!browser) {
		return;
	}

	localStorage.setItem(key, JSON.stringify(value));
}

export function removeItem(key: string): void {
	if (!browser) {
		return;
	}

	localStorage.removeItem(key);
}
