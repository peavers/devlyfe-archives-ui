export interface Author {
	id: string;
	real_name: string | null;
	display_name: string;
	avatar: string;
	is_bot: boolean;
	tz: string | null;
	tz_offset: number | null;
	color: string | null;
}

export interface SlackMessage {
	type: string | null;
	id: string;
	ts: string;
	text: string;
	author: Author;
}