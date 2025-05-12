<script lang="ts">
    import TaskNode from './TaskNode.svelte';
    import AddButton from './AddButton.svelte';
    import { tasks } from '$lib/stores/TaskStore';
    import { activeTaskId } from '$lib/stores/Navigation';
    import { dndzone } from 'svelte-dnd-action';
    import { flip } from 'svelte/animate';
    import { fly } from 'svelte/transition';

    function findTask(items: Task[], id: string): Task | null {
        for (const t of items) {
            if (t.id === id) return t;
            if (t.children.length) {
                const f = findTask(t.children, id);
                if (f) return f;
            }
        }
        return null;
    }

    let navStack: string[] = [];

    $: allTasks = $tasks;
    $: focusedTask = $activeTaskId ? findTask(allTasks, $activeTaskId) : null;
    $: displayedTasks = focusedTask ? focusedTask.children : allTasks;

    let newTodo = '';

    function add() {
        if (newTodo.trim()) {
            tasks.addTask(newTodo.trim());
            newTodo = '';
        }
    }

    function syncOrder(event: CustomEvent) {
        const items = event.detail.items as Task[];
        if ($activeTaskId) {
            tasks.reorderChildren($activeTaskId, items);
        } else {
            tasks.reorderChildren(null, items);
        }
    }

    function handleEnter(event: CustomEvent<{ id: string }>) {
        navStack.push($activeTaskId);
        activeTaskId.set(event.detail.id);
    }

    function goBack() {
        const prev = navStack.pop() ?? null;
        activeTaskId.set(prev);
    }
</script>

<div class="space-y-4 w-full max-w-md mx-auto font-sans">
    <header class="text-gray-500 text-2xl font-bold mb-2 text-shadow-sm">
        {#if focusedTask}
            <button on:click={goBack} class="btn-back">← 이전으로</button>
            <h2>“{focusedTask.title}” 하위 작업</h2>
        {:else}
            <h2>전체 작업</h2>
        {/if}
    </header>

    <div
        use:dndzone={{ 
            items: displayedTasks, 
            flipDurationMs:200,
            dropTargetStyle: {}
        }}
        on:consider={syncOrder}
        on:finalize={syncOrder}
        class="w-full flex flex-col gap-3">
        {#each displayedTasks as task (task.id)}
            <div in:fly={{ y: 20, duration: 250 }} animate:flip={{ duration: 200 }}>
                <TaskNode {task} on:enter={handleEnter} />
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
