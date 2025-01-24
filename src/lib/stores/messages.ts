import { writable } from 'svelte/store';
import type { SlackMessage } from '../types';
import { authToken } from './auth';
import { browser } from '$app/environment';
import { MessagesAPI } from '$lib/apiService';

export type SortOrder = 'asc' | 'desc';

interface MessagesState {
	messages: SlackMessage[];
	nextCursor: string | null;
	hasMore: boolean;
	loading: boolean;
	searchTerm: string;
	sortOrder: SortOrder;
}

function createMessagesStore() {
	const getInitialSortOrder = (): SortOrder => {
		if (!browser) return 'desc';
		return (sessionStorage.getItem('sortOrder') as SortOrder) || 'desc';
	};

	const { subscribe, set, update } = writable<MessagesState>({
		messages: [],
		nextCursor: null,
		hasMore: true,
		loading: false,
		searchTerm: '',
		sortOrder: getInitialSortOrder()
	});

	if (browser) {
		subscribe((store) => {
			sessionStorage.setItem('sortOrder', store.sortOrder);
		});
	}

	function sortMessages(messages: SlackMessage[], order: SortOrder): SlackMessage[] {
		return [...messages].sort((a, b) =>
			order === 'desc'
				? new Date(b.ts).getTime() - new Date(a.ts).getTime()
				: new Date(a.ts).getTime() - new Date(b.ts).getTime()
		);
	}

	return {
		subscribe,
		loadMessages: async () => {
			let state: MessagesState | undefined;
			let token = '';

			const unsubStore = subscribe((s) => (state = s));
			const unsubToken = authToken.subscribe((t) => (token = t));

			if (!state) {
				throw new Error('Failed to get store state');
			}

			try {
				update((s) => ({ ...s, loading: true }));

				const api = new MessagesAPI(token);
				const data = await api.fetchMessages({
					searchTerm: state.searchTerm,
					sortOrder: state.sortOrder,
					cursor: state.nextCursor
				});

				if (data.messages?.length > 0) {
					update((store) => {
						const uniqueMessages = new Map(store.messages.map((msg) => [msg.id, msg]));

						data.messages.forEach((msg) => {
							if (!uniqueMessages.has(msg.id)) {
								uniqueMessages.set(msg.id, msg);
							}
						});

						const merged = sortMessages(Array.from(uniqueMessages.values()), store.sortOrder);

						return {
							...store,
							messages: merged,
							nextCursor: data.next_cursor ?? null,
							hasMore: !!data.next_cursor
						};
					});
				} else {
					update((s) => ({ ...s, hasMore: false }));
				}
			} finally {
				update((s) => ({ ...s, loading: false }));
				unsubStore();
				unsubToken();
			}
		},
		reset: () => {
			update((store) => ({
				...store,
				messages: [],
				nextCursor: null,
				hasMore: true
			}));
		},
		setSearchTerm: (term: string) => {
			update((store) => ({ ...store, searchTerm: term }));
		},
		setSortOrder: (order: SortOrder) => {
			update((store) => ({
				...store,
				sortOrder: order,
				messages: sortMessages(store.messages, order)
			}));
		}
	};
}

export const messagesStore = createMessagesStore();
