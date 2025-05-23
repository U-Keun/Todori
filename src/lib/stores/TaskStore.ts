import { writable, get } from 'svelte/store';
import type { Task, PageData } from '../types';
import { invoke } from '@tauri-apps/api/core';
import { tick } from 'svelte';

export const activeTaskId = writable<string | null>(null);
export const historyStack = writable<string[]>([]);
export const navDirection = writable('forward');
export const pageData = writable<PageData>({ parentTitle: 'project', children: [] });

export async function fetchPage(id: string | null): Promise<PageData> {
    let parentTitle = 'Project';
    if (id !== null) {
        const parent: Task = await invoke('get_task', { id });
        parentTitle = parent.title;
    }
    const children = id === null
        ? await invoke<Task[]>('load_root_tasks')
        : await invoke<Task[]>('load_subtasks', { parentId: id });
    const pd: PageData = { parentTitle, children };
    pageData.set(pd);
    return pd;
}

export async function navigateTo(id: string) {
    console.log("navigateTo() is called");
    navDirection.set('forward');
    const current = get(activeTaskId);
    if (current && current !== id) {
        historyStack.update(stack => [...stack, current]);
    }
    activeTaskId.set(id);
    await fetchPage(id);

    await tick();
    document.scrollingElement?.scrollTo({ top: 0, behavior: 'auto' });    
}

export async function navigateBack() {
    navDirection.set('back');
    const stack = get(historyStack);
    if (stack.length > 0) {
        const prev = stack[stack.length - 1];
        historyStack.set(stack.slice(0, -1));
        activeTaskId.set(prev);
        await fetchPage(prev);
    } else {
        activeTaskId.set(null);
        await fetchPage(null);
    }

    await tick();
    document.scrollingElement?.scrollTo({ top: 0, behavior: 'auto' });    
}

async function refreshCurrent() {
    const id = get(activeTaskId);
    await fetchPage(id);
}

export async function addTask(parentId: string | null, title: string): Promise<Task> {
    const created: Task = await invoke('add_task', { parentId, title });
    refreshCurrent();
    return created;
}

export async function updateTask(id: string, newTitle: string): Promise<Task> {
    const updated: Task = await invoke('update_task', { id, newTitle });
    await refreshCurrent();
    return updated;
}

export async function toggleTask(id: string): Promise<Task> {
    const updated: Task = await invoke('toggle_complete', { id });
    await refreshCurrent();
    return updated;
}

export async function removeTask(id: string): Promise<void> {
    await invoke('remove_task', { id });
    await refreshCurrent();
}

export async function reorderChildren(parentId: string | null, newOrder: string[]): Promise<void> {
    await invoke('reorder_children', { parentId, newOrder });
    await refreshCurrent();
}

export function clearCache() {
    historyStack.set([]);
    activeTaskId.set(null);
    pageData.set({ parentTitle: 'Project', children: [] });
}
