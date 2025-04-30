<script lang="ts">
    import TodoItem from './TodoItem.svelte';
    import AddButton from './AddButton.svelte';
    import { todos } from '$lib/stores/todos';
    import { dndzone } from 'svelte-dnd-action';
    import { flip } from 'svelte/animate';
    import { fly } from 'svelte/transition';

    let newTodo = '';

    function add() {
        if (newTodo.trim()) {
            todos.add(newTodo.trim());
            newTodo = '';
        }
    }

    function syncOrder(event: CustomEvent) {
        todos.set(event.detail.items);
    }
</script>

<div class="space-y-4 w-full max-w-md mx-auto font-sans">
    <header class="text-gray-500 text-2xl font-bold mb-2 text-shadow-sm">
        {new Date().toLocaleDateString()}'s ToDo
    </header>

    <div
        use:dndzone={{ 
            items: $todos, 
            flipDurationMs:200,
            dropTargetStyle: {}
        }}
        on:consider={syncOrder}
        on:finalize={syncOrder}
        class="w-full flex flex-col gap-3">
        {#each $todos as todo (todo.id)}
            <div 
                in:fly={{ y: 20, duration: 250, opacity: 0 }}
                animate:flip={{ duration: 200 }}>
                <TodoItem {todo} />
            </div>
        {/each}
    </div>

    <form class="relative w-full max-w-md mt-4" on:submit|preventDefault={add}>
        <AddButton
            on:add={add}
            class="absolute inset-y-0 left-2 top-1/2 -translate-y-1/2 z-10" />

        <input
            bind:value={newTodo}
            placeholder="new ToDo"
            class="w-full pl-12 border-0 rounded-xl border pr-4 py-2 bg-white dark:bg-white focus:outline-none shadow" />
    </form>

</div>
