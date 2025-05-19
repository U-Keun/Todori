import type { Task, PageData } from '../types';
import { invoke } from '@tauri-apps/api/core';

const childrenCache = new Map<string, Task[]>();
const titleCache = new Map<string, string>();

function cacheKey(id: string | null) {
    return id ?? 'root';
}

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

    const key = id ?? 'root';
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

function invalidateChildren(id: string | null) {
    childrenCache.delete(cacheKey(id));
}

export async function addTask(parentId: string | null, title: string): Promise<Task> {
    const created: Task = await invoke('add_task', { parentId, title });
    invalidateChildren(parentId);
    return created;
}

export async function updateTask(id: string, newTitle: string): Promise<Task> {
    const updated: Task = await invoke('update_task', { id, newTitle });
    invalidateChildren(null);
    titleCache.delete(id);
    return updated;
}

export async function toggleTask(id: string): Promise<Task> {
    console.log("hello");
    const updated: Task = await invoke('toggle_complete', { id });
    invalidateChildren(null);
    return updated;
}

export async function removeTask(id: string): Promise<void> {
    await invoke('remove_task', { id });
    invalidateChildren(null);
}

export async function reorderChildren(parentId: string | null, newOrder: string[]): Promise<void> {
    await invoke('reorder_children', { parentId, newOrder });
    invalidateChildren(parentId);
}

export function clearCache() {
    childrenCache.clear();
    titleCache.clear();
}
