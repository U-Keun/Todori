import { writable, get } from 'svelte/store';
import type { Task } from '../types';
import { invoke } from '@tauri-apps/api/core';

export const activeTaskId = writable<string | null>(null);
export const historyStack = writable<string[]>([]);
export const activeTask = writable<Task | null>(null);

const cache = new Map<string, Task>();

async function fetchTask(id: string): Promise<Task> {
    if (cache.has(id)) return cache.get(id)!;
    const task = await invoke<Task>('get_task', { id });
    cache.set(id, task);
    return task;
}

export async function navigateTo(id: string) {
    const curId = get(activeTaskId);
    if (curId) {
        historyStack.update(stack => { stack.push(curId); return stack; });
    }
    const next = await fetchTask(id);
    activeTask.set(next);
    activeTaskId.set(id);
}

export function navigateBack() {
    historyStack.update(stack => {
        if (stack.length === 0) {
            activeTaskId.set(null);
        } else {
            const prev = stack.pop()!;
            activeTaskId.set(prev);
        }
        return stack;
    });
}
