import { writable, get } from 'svelte/store';

export const activeTaskId = writable<string | null>(null);
export const historyStack = writable<string[]>([]);
export const navDirection = writable<'forward' | 'back'>('forward');

export async function navigateTo(id: string) {
    navDirection.set('forward');
    const curId = get(activeTaskId);
    if (curId) {
        historyStack.update(stack => { stack.push(curId); return stack; });
    }
    activeTaskId.set(id);
}

export function navigateBack() {
    navDirection.set('back');
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
