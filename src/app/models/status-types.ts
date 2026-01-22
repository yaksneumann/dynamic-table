export const DEFAULT_STATUS_TYPES = [
	'ready',
	'inProgress',
	'completed',
	'urgent',
] as const;

export type StatusType = typeof DEFAULT_STATUS_TYPES[number];

export type StatusSummary = Record<string, number> & { total: number };
