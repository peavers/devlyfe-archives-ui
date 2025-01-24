import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'authToken';

function createAuthStore() {
	const storedToken = browser ? localStorage.getItem(STORAGE_KEY) : '';
	const { subscribe, set, update } = writable(storedToken || '');

	if (browser) {
		subscribe((value) => {
			if (value) localStorage.setItem(STORAGE_KEY, value);
		});
	}

	return {
		subscribe,
		set,
		update
	};
}

export const authToken = createAuthStore();
