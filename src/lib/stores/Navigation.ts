import { writable } from 'svelte/store';

export const activeTaskId = writable<string | null>(null);
