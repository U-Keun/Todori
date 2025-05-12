import { writable } from 'svelte/store';
import type { Task } from '../types';

function traverseToggle(
    items: Task[],
    id: string,
): Task[] {
    return items.map(item => {
        if (item.id === id) {
            return { ...item, completed: !item.completed };
        }
        if (item.children.length > 0) {
            return { ...item, children: traverseToggle(item.children, id) };
        }
        return item;
    });
}

function traverseAddChild(
    items: Task[],
    parentId: string,
    child: Task
): Task[] {
    return items.map(item => {
        if (item.id === parentId) {
            return { ...item, isExpanded: true, children: [...item.children, child] };
        }
        if (item.children.length > 0) {
            return { ...item, children:traverseAddChild(item.children, parentId, child) };
        }
        return item;
    });
}

function traverseUpdateText(
    items: Task[],
    id: string,
    newText: string
): Task[] {
    return items.map(item => {
        if (item.id === id) {
            return { ...item, title: newText };
        }
        if (item.children.length > 0) {
            return { ...item, children: traverseUpdateText(item.children, id, newText) };
        }
        return item;
    });
}

function traverseRemove(
    items: Task[],
    id: string
): Task[] {
    return items.reduce<Task[]>((acc, item) => {
        if (item.id === id) {
            return acc;
        }
        const updated = item.children.length
            ? { ...item, children: traverseRemove(item.children, id) }
            : item;
        return [...acc, updated];
    }, []);
}

function createTaskStore() {
    const { subscribe, set, update } = writable<Task[]>([]);

    return {
        subscribe,
        set,
        addTask: (title: string, parentId?: string) => {
            const newTask: Task = {
                id: crypto.randomUUID(),
                title,
                completed: false,
                children: []
            };
            update(tasks => 
                parentId
                    ? traverseAddChild(tasks, parentId, newTask)
                    : [...tasks, newTask]
            );
        },
        toggleComplete: (id: string) => {
            update(tasks => traverseToggle(tasks, id));
        },
        updateText: (id: string, newText: string) => {
            update(tasks => traverseUpdateText(tasks, id, newText));
        },
        removeTask: (id: string) => {
            update(tasks => traverseRemove(tasks, id));
        },
    };
}

export const tasks = createTaskStore();
