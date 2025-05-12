import { writable } from 'svelte/store';
import type { Task } from '../types';

function traverseToggle(
    items: Task[],
    id: string,
    prop: 'completed' | 'isExpanded'
): Task[] {
    return items.map(item => {
        if (item.id === id) {
            return { ...item, [prop]: !item[prop] };
        }
        if (item.children.length > 0) {
            return { ...item, children: traverseToggle(item.children, id, prop) };
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

function traverseUpdateSubText(
    items: Task[],
    parentId: string,
    childId: string,
    newText: string
): Task[] {
    return items.map(item => {
        if (item.id === parentId) {
            const children = item.children.map(child =>
                child.id === childId
                ? { ...child, title: newText }
                : child.children.length
                ? { ...child, children: traverseUpdateSubText(child.children, parentId, childId, newText) }
                : child
            );
            return { ...item, children };
        }
        if (item.children.length > 0) {
            return { ...item, children: traverseUpdateSubText(item.children, parentId, childId, newText) };
        }
        return item;
    });
}

function traverseRemoveSubTask(
    items: Task[],
    parentId: string,
    childId: string
): Task[] {
    return items.map(item => {
        if (item.id === parentId) {
            return { ...item, children: item.children.filter(child => child.id != childId) };
        }
        if (item.children.length > 0) {
            return { ...item, children: traverseRemoveSubTask(item.children, parentId, childId) };
        }
        return item;
    });
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
                isExpanded: false,
                children: []
            };
            update(tasks => 
                parentId
                    ? traverseAddChild(tasks, parentId, newTask)
                    : [...tasks, newTask]
            );
        },
        toggleComplete: (id: string) => {
            update(tasks => traverseToggle(tasks, id, 'completed'));
        },
        toggleExpand: (id: string) => {
            update(tasks => traverseToggle(tasks, id, 'isExpanded'));
        },
        updateText: (id: string, newText: string) => {
            update(tasks => traverseUpdateText(tasks, id, newText));
        },
        removeTask: (id: string) => {
            update(tasks => traverseRemove(tasks, id));
        },
        updateSubText: (parentId: string, childId: string, newText: string) => {
            update(tasks => traverseUpdateSubText(tasks, parentId, childId, newText));
        },
        removeSubTask: (parentId: string, childId: string) => {
            update(tasks => traverseRemoveSubTask(tasks, parentId, childId));
        },
    };
}

export const tasks = createTaskStore();
