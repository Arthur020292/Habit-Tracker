import { writable } from 'svelte/store';

export type StorageNotice = {
	tone: 'error' | 'info';
	message: string;
};

function createStorageNoticeStore() {
	const { subscribe, set } = writable<StorageNotice | null>(null);

	return {
		subscribe,
		report(message: string, tone: StorageNotice['tone'] = 'error') {
			set({ tone, message });
		},
		clear() {
			set(null);
		}
	};
}

export const storageNotice = createStorageNoticeStore();
