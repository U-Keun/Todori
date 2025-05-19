import { writable, get } from 'svelte/store';
import type { Task, PageData } from '../types';
import { invoke } from '@tauri-apps/api/core';

export const activeTaskId = writable<string | null>(null);
export const historyStack = writable<string[]>([]);
export const navDirection = writable('forward');
export const pageData = writable<PageData>({ parentTitle: 'project', children: [] });

const childrenCache = new Map<string, Task[]>();
const titleCache = new Map<string, string>();
const cacheKey = (id: string | null) => id ?? 'root';
const invalidate = (id: string | null) => childrenCache.delete(cacheKey(id));

export async function fetchPage(id: string | null): Promise<PageData> {
    let parentTitle = 'Project';
    if (id !== null) {
        if (titleCache.has(id)) {
            parentTitle = titleCache.get(id)!;
        } else {
            const parent: Task = await invoke('get_task', { id });
            parentTitle = parent.title;
            titleCache.set(id, parentTitle);
        }
    }

    const key = cacheKey(id);
    let children: Task[];
    if (childrenCache.has(key)) {
        children = childrenCache.get(key)!;
    } else {
        children = id === null
            ? await invoke<Task[]>('load_root_tasks')
            : await invoke<Task[]>('load_subtasks', { parentId: id });
        childrenCache.set(key, children);
    }

    return { parentTitle, children };
}

export async function navigateTo(id: string) {
    navDirection.set('forward');
    const cur = get(activeTaskId);
    if (cur && cur !== id) {
        historyStack.update(stack => [...stack, cur]);
    }
    activeTaskId.set(id);
    invalidate(id);
    const data = await fetchPage(id);
    pageData.set(data);
}

export async function navigateBack() {
    navDirection.set('back');
    const stack = get(historyStack);
    const prev = stack.length ? stack[stack.length - 1] : null;
    historyStack.set(stack.length ? stack.slice(0, -1) : []);
    activeTaskId.set(prev);
    invalidate(prev);
    const data = await fetchPage(prev);
    pageData.set(data);
}

function invalidateChildren(id: string | null) {
    childrenCache.delete(cacheKey(id));
}

export async function addTask(parentId: string | null, title: string): Promise<Task> {
    const created: Task = await invoke('add_task', { parentId, title });
    invalidate(parentId);
    const data = await fetchPage(get(activeTaskId));
    pageData.set(data);
    return created;
}

export async function updateTask(id: string, newTitle: string): Promise<Task> {
    const updated: Task = await invoke('update_task', { id, newTitle });
    invalidate(get(activeTaskId));
    titleCache.delete(id);
    const data = await fetchPage(get(activeTaskId));
    pageData.set(data);
    return updated;
}

export async function toggleTask(id: string): Promise<Task> {
    const updated: Task = await invoke('toggle_complete', { id });
    invalidate(get(activeTaskId));
    const data = await fetchPage(get(activeTaskId));
    pageData.set(data);
    return updated;
}

export async function removeTask(id: string): Promise<void> {
    const parent = get(activeTaskId);
    await invoke('remove_task', { id });
    invalidate(parent);
    const data = await fetchPage(get(activeTaskId));
    pageData.set(data);
}

export async function reorderChildren(parentId: string | null, newOrder: string[]): Promise<void> {
    await invoke('reorder_children', { parentId, newOrder });
    invalidate(parentId);
    const data = await fetchPage(get(activeTaskId));
    pageData.set(data);
}

export function clearCache() {
    childrenCache.clear();
    titleCache.clear();
    historyStack.set([]);
    pageData.set({ parentTitle: 'Project', children: [] });
}
