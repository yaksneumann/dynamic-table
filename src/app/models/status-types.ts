export const STATUS_TYPES = ['ready', 'inProgress', 'completed', 'urgent'] as const;
export type StatusType = typeof STATUS_TYPES[number];

export type StatusSummary = Record<StatusType | 'total', number>;
