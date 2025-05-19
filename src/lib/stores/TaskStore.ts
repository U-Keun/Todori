import type { Task } from '../types';
import { invoke } from '@tauri-apps/api/core';

const childrenCache = new Map<string, Task[]>();
const titleCache = new Map<string, string>();

export interface PageData {
    parentTitle: string;
    children: Task[];
}

export async function fetchPage(id: string | null): Promise<PageData> {
    let parentTitle = '전체 작업';
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
    let children: Taks[];
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
