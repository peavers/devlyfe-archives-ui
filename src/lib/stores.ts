import { writable } from 'svelte/store';
import type { SlackMessage } from './types';

type SortOrder = 'asc' | 'desc';

interface MessagesStore {
	messages: SlackMessage[];
	currentPage: number;
	hasMore: boolean;
	loading: boolean;
	searchTerm: string;
	sortOrder: SortOrder;
}

const storedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : '';
export const authToken = writable(storedToken || '');

if (typeof window !== 'undefined') {
	authToken.subscribe(value => {
		if (value) {
			localStorage.setItem('authToken', value);
		}
	});
}

const storedSortOrder = typeof sessionStorage !== 'undefined' ?
	(sessionStorage.getItem('sortOrder') as SortOrder) || 'desc' :
	'desc';

export const messagesStore = writable<MessagesStore>({
	messages: [],
	currentPage: 1,
	hasMore: true,
	loading: false,
	searchTerm: '',
	sortOrder: storedSortOrder
});

if (typeof window !== 'undefined') {
	messagesStore.subscribe(store => {
		sessionStorage.setItem('sortOrder', store.sortOrder);
	});
}

export async function loadMessages() {
	messagesStore.update(store => ({ ...store, loading: true }));

	let currentStore: MessagesStore = {
		messages: [],
		currentPage: 1,
		hasMore: true,
		loading: true,
		searchTerm: '',
		sortOrder: 'desc'
	};

	const unsubStore = messagesStore.subscribe(store => {
		currentStore = store;
	});

	let token: string;
	const unsubToken = authToken.subscribe(t => {
		token = t;
	});

	try {
		const searchParam = currentStore.searchTerm ?
			`&search=${encodeURIComponent(currentStore.searchTerm)}` : '';
		const sortParam = `&sort=${currentStore.sortOrder}`;

		const res = await fetch(
			`https://dzv1rhjtsh.execute-api.us-west-2.amazonaws.com/prod/messages?page=${currentStore.currentPage}${searchParam}${sortParam}`,
			{
				headers: {
					'Authorization': token,
					'Content-Type': 'application/json'
				}
			}
		);
		const data = await res.json();

		if (data.messages?.length > 0) {
			messagesStore.update(store => ({
				...store,
				messages: [...store.messages, ...data.messages],
				currentPage: store.currentPage + 1,
				hasMore: store.currentPage < data.pagination.totalPages
			}));
		} else {
			messagesStore.update(store => ({
				...store,
				hasMore: false
			}));
		}
	} finally {
		messagesStore.update(store => ({ ...store, loading: false }));
		unsubStore();
		unsubToken();
	}
}

export function resetMessages() {
	messagesStore.update(store => ({
		...store,
		messages: [],
		currentPage: 1,
		hasMore: true
	}));
}