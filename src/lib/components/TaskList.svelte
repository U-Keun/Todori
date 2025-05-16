<script lang="ts">
    import { onMount } from 'svelte';
    import { invoke } from '@tauri-apps/api/core';
    import type { Task } from '../types';
    import { activeTaskId } from '$lib/stores/Navigation';
    import { TaskNode, AddButton } from '$lib/components';
    import { dndzone } from 'svelte-dnd-action';
    import { fly } from 'svelte/transition';
    import { flip } from 'svelte/animate';

    let displayedTasks: Task[] = [];
    let loading = false;
    let newTitle = '';

    async function loadTasks() {
        loading = true;
        try { 
            if ($activeTaskId === null) {
                displayedTasks = await invoke<Task[]>('load_root_tasks');
            } else {
                displayedTasks = await invoke<Task[]>('load_subtasks', { parentId: $activeTaskId });
            }
        } catch (e) {
            console.error('loadTasks error', e);
        } finally {
            loading = false;
        }
    }

    onMount(loadTasks);
    $: $activeTaskId, loadTasks();

    function updateLocal(updated: Task) {
        displayedTasks = displayedTasks.map(t =>
            t.id === updated.id
                ? updated
                : { ...t, children: t.children.map(c => c.id === updated.id ? updated : c) }
        );
    }

    function removeLocal(id: string) {
        displayedTasks = displayedTasks
            .filter(t => t.id !== id)
            .map(t => ({ ...t, children: t.children.filter(c => c.id !== id) }));
    }

    function addLocalChild(parentId: string, child: Task) {
        displayedTasks = displayedTasks.map(t =>
            t.id === parentId
                ? { ...t, children: [...t.children, child] }
                : t
        );
    } 

    async function handleAdd() {
        if (!newTitle.trim()) return;
        const created: Task = await invoke('add_task', {
            title: newTitle,
            parentId: $activeTaskId ?? null
        });
        displayedTasks = [...displayedTasks, created];
        newTitle = '';
    }

    async function handleAddChild(event: CustomEvent<{ parentId: string; text: string }>) {
        const { parentId, text } = event.detail;
        const created: Task = await invoke('add_task', { title: text, parentId });
        addLocalChild(parentId, created);
    }
    
    async function handleUpdate(id: string, newTitle: string) {
        const updated: Task = await invoke('update_task', { id, newTitle });
        updateLocal(updated);
    }

    async function handleToggle(id: string) {
        const updated: Task = await invoke('toggle_complete', { id });
        updateLocal(updated);
    }

    async function handleRemove(id: string) {
        await invoke('remove_task', { id });
        removeLocal(id);
    }

    function syncOrder(event: CustomEvent) {
        const items = event.detail.items as Task[];
        invoke('reorder_children', { 
            parentId: $activeTaskId, 
            newOrder: items.map(i => i.id) 
        });
        displayedTasks = items;
    }

    function handleEnter(event: CustomEvent<{ id: string }>) {
        activeTaskId.set(event.detail.id);
    }

    function goBack() {
        activeTaskId.set(null);
    }
</script>

<div class="max-w-md mx-auto p-4 space-y-4 font-sans">
    <header class="flex items-center justify-between text-gray-500">
        {#if $activeTaskId}
            <button on:click={goBack} class="px-2 py-1 bg-gray-200 rounded">go back</button>
            <h2 class="text-lg font-bold">“{displayedTasks[0]?.title ?? '...'}“ 하위 작업</h2>
        {:else}
            <h2 class="text-lg font-bold">전체 작업</h2>
        {/if}
    </header>

    {#if loading}
        <div class="space-y-2 animate-pulse">
            <div class="h-6 bg-gray-200 rounded"></div>
            <div class="h-6 bg-gray-200 rounded"></div>
            <div class="h-6 bg-gray-200 rounded"></div>
        </div>
    {:else}
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
                <div in:fly={{ y: 20, duration: 250 }} animate:flip={{duration: 200 }}>
                    <TaskNode
                        {task}
                        on:enter={handleEnter}
                        on:toggle={() => handleToggle(task.id)}
                        on:add={handleAddChild}
                        on:edit={(e) => handleUpdate(task.id, e.detail.text)}
                        on:remove={() => handleRemove(task.id)}
                        on:subtoggle={({ detail }) => handleToggle(detail.id)}
                        on:subedit={({ detail }) => handleUpdate(detail.id, detail.text)}
                        on:subremove={({ detail }) => handleRemove(detail.id)}
                    />
                </div>
            {/each}
        </div>
    {/if}
    <form class="relative w-full max-w-md mt-4">
        <AddButton
            on:add={handleAdd}
            class="absolute inset-y-0 left-2 top-1/2 -translate-y-1/2 z-10" />

        <input
            bind:value={newTitle}
            placeholder="new task"
            class="w-full pl-12 border-0 rounded-xl border pr-4 py-2 bg-white dark:bg-white focus:outline-none shadow" />
    </form>
</div>
