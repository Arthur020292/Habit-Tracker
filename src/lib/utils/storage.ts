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

export function writeJson<T>(key: string, value: T): boolean {
	if (!browser) {
		return false;
	}

	try {
		localStorage.setItem(key, JSON.stringify(value));
		return true;
	} catch {
		return false;
	}
}

export function removeItem(key: string): boolean {
	if (!browser) {
		return false;
	}

	try {
		localStorage.removeItem(key);
		return true;
	} catch {
		return false;
	}
}

export function hasPersistentStorageSupport(): boolean {
	return browser && typeof navigator !== 'undefined' && 'storage' in navigator && typeof navigator.storage.persist === 'function';
}

export async function isPersistentStorageEnabled(): Promise<boolean> {
	if (!hasPersistentStorageSupport()) {
		return false;
	}

	try {
		return await navigator.storage.persisted();
	} catch {
		return false;
	}
}

export async function requestPersistentStorage(): Promise<boolean> {
	if (!hasPersistentStorageSupport()) {
		return false;
	}

	try {
		return await navigator.storage.persist();
	} catch {
		return false;
	}
}
