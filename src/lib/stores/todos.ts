import { writable } from 'svelte/store';

export interface Todo {
    id: string;
    text: string;
    done: boolean;
    order: number;
    subTodos?: Todo[];
    isOpen?: boolean;
};

function createTodoStore() {
    const { subscribe, update, set } = writable<Todo[]>([]);

    function groupByDone(list: Todo[]): Todo[] {
        const undone = list.filter(t => !t.done);
        const done = list.filter(t => t.done);
        return [...undone, ...done];
    }

    return {
        subscribe,
        add: (text: string) => 
            update(t => {
                const newItem: Todo = { id: crypto.randomUUID(), text, done: false, order: t.length };
                return groupByDone([...t, newItem]);
            }),
        setIsOpen: (id: string, isOpen: boolean) =>
            update(todos => todos.map(todo =>
                                      todo.id === id ? { ...todo, isOpen } : todo
            )),
        addSubTodo: (parentId: string, text: string) => 
            update(t => {
                return t.map(todo => {
                    if (todo.id === parentId) {
                        const newSub = { id: crypto.randomUUID(), text, done: false, order: (todo.subTodos?.length ?? 0) };
                        const updatedSubs = [... (todo.subTodos ?? []), newSub];
                        return { ...todo, subTodos: updatedSubs };
                    } 
                    return todo;
                });
            }),
        toggle: (id: string) => 
            update(t => {
                const toggleFn = (todo: Todo): Todo => {
                    if (todo.id === id) return { ...todo, done: !todo.done };
                    if (todo.subTodos) {
                        return { ... todo, subTodos: todo.subTodos.map(toggleFn) };
                    }
                    return todo;
                };
                const toggled = t.map(toggleFn);
                return groupByDone(toggled);
            }),
        remove: (id: string) => 
            update(t => {
                const removeFn = (list: Todo[]): Todo[] =>
                    list.filter(todo => {
                        if (todo.id === id) return false;
                        if (todo.subTodos) todo.subTodos = removeFn(todo.subTodos);
                        return true;
                    });
                return removeFn(t);
            }),
        removeSubTodo: (parentId: string, subId: string) => 
            update(todos => {
                return todos.map(todo => {
                    if (todo.id === parentId) {
                        const subTodos = todo.subTodos?.filter(sub => sub.id !== subId) ?? [];
                        return { ...todo, subTodos };
                    }
                    return todo;
                });
            }),
        updateText(id: string, newText: string) {
            update(list => list.map(t => t.id === id ? { ...t, text: newText } : t));
        },
        updateSubText(parentId: string, subId: string, newText: string) {
            update(list => 
                   list.map(t => {
                       if (t.id === parentId && t.subTodos) {
                           return {
                               ...t,
                               subTodos: t.subTodos.map(s => s.id === subId ? { ...s, text: newText } : s)
                           };
                       }
                       return t;
                   })
                  );
        },
        reorder: (from: number, to: number) =>
            update(t => {
                const moved = [...t];
                const [item] = moved.splice(from, 1);
                moved.splice(to, 0, item);
                return moved.map((v, i) => ({ ...v, order: i }));
            }),
        set: (newList: Todo[]) =>
            update(() => groupByDone(newList)),
    };
}

export const todos = createTodoStore();
