import { writable } from 'svelte/store';

function createUiStore() {
	const { subscribe, set } = writable({
		overlayOpen: false
	});

	return {
		subscribe,
		setOverlayOpen(overlayOpen: boolean) {
			set({ overlayOpen });
		}
	};
}

export const ui = createUiStore();
