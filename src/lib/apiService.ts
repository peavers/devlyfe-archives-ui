import type { SlackMessage } from '$lib/types';

const API_BASE_URL = 'https://dzv1rhjtsh.execute-api.us-west-2.amazonaws.com/prod';

export class AuthAPI {
	async validateToken(token: string): Promise<Response> {
		return fetch(`${API_BASE_URL}/validate`, {
			headers: { Authorization: token }
		});
	}
}

export class MessagesAPI {
	constructor(private token: string) {}

	async fetchMessages(params: {
		searchTerm?: string;
		sortOrder: 'asc' | 'desc';
		cursor?: string | null;
	}): Promise<{ messages: SlackMessage[]; next_cursor?: string }> {
		const searchParam = params.searchTerm ? `&search=${encodeURIComponent(params.searchTerm)}` : '';
		const sortParam = `&sort=${params.sortOrder}`;
		const cursorParam = params.cursor ? `&cursor=${encodeURIComponent(params.cursor)}` : '';

		const url = `${API_BASE_URL}/db-messages?${searchParam}${sortParam}${cursorParam}`;

		const response = await fetch(url, {
			headers: {
				Authorization: this.token,
				'Content-Type': 'application/json'
			},
			mode: 'cors'
		});

		return response.json();
	}
}
