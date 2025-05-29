<script lang="ts">
    import type { Task } from '../types';
    import { activeTaskId, fetchPage, addTask, updateTask, toggleTask, removeTask, reorderChildren } from '$lib/stores/TaskStore';
    import { TaskHeader, TaskNode, AddButton } from '$lib/components';
    import { fly, fade } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import { cubicOut } from 'svelte/easing';
    import { dndzone } from 'svelte-dnd-action';

    let displayedTasks: Task[] = [];
    let parentTitle = 'Project';
    let loading = false;
    let newTitle = '';

    $: if (typeof $activeTaskId !== 'undefined') {
        loading = true;
        fetchPage($activeTaskId)
            .then(({ parentTitle: t, children }) => {
                parentTitle = t;
                displayedTasks = children;
            })
            .catch(console.error)
            .finally(() => loading = false);
    }

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
        const created  = await addTask($activeTaskId, newTitle);
        displayedTasks = [...displayedTasks, created];
        newTitle = '';
    }

    async function handleAddChild(event: CustomEvent<{ parentId: string; text: string }>) {
        const { parentId, text } = event.detail;
        const created = await addTask(parentId, text);
        addLocalChild(parentId, created);
    }
    
    async function handleUpdate(id: string, newTitle: string) {
        const updated = await updateTask(id, newTitle);
        updateLocal(updated);
    }

    async function handleToggle(id: string) {
        const updated = await toggleTask(id);
        updateLocal(updated);
    }

    async function handleRemove(id: string) {
        await removeTask(id);
        removeLocal(id);
    }

    async function syncOrder(event: CustomEvent) {
        displayedTasks = event.detail.items as Task[];
        await reorderChildren($activeTaskId, displayedTasks.map(t => t.id));
    }
</script>

<div
    class="page-container">
    {#key $activeTaskId}
        <div 
            in:fly={{ y: 30, duration: 500, easing: cubicOut }}
            class="header-wrapper"
        >
            <TaskHeader
                activeId={$activeTaskId} 
                title={$activeTaskId ? parentTitle : 'Project'} 
                class="text-lg font-bold"
            />
        </div>
        <div 
            in:fade={{ delay: 500, duration: 500}}
            class="content-wrapper"
        >
            {#if loading}
                <div class="loading-skeleton">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                </div>
            {:else}
                <div
                    use:dndzone={{
                        items: displayedTasks,
                        flipDurationMs: 0,
                    }}
                    on:consider={syncOrder}
                    on:finalize={syncOrder}
                    class="task-list">
                    {#each displayedTasks as task, i (task.id)}
                        <div animate:flip={{ duration: 200 }}>
                            <TaskNode
                                {task}
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
        </div>
        <div 
            in:fade={{ delay: 1000, duration: 500 }}
            class="footer-wrapper"
        >
            <form class="relative w-full max-w-md mt-4">
                <AddButton
                    on:add={handleAdd}
                    class="absolute inset-y-0 left-2 top-1/2 -translate-y-1/2 z-10" />

                <input
                    bind:value={newTitle}
                    placeholder="new task"
                    class="new-task-input" />
            </form>
        </div>
    {/key}
</div>

<style lang="postcss">
  .page-container {
    @apply h-screen max-w-md mx-auto p-4 space-y-4 font-sans h-[90vh];
  }
  .header-wrapper {
    @apply fixed top-4 inset-x-4 max-w-md mx-auto z-20;
  }
  .content-wrapper {
    @apply mt-[60px] mb-[80px] overflow-y-auto pt-[5px] pb-[80px] w-full max-w-md flex-1;
  }
  .loading-skeleton {
    @apply space-y-2 animate-pulse;
  }
  .skeleton-line {
    @apply h-6 bg-gray-200 rounded;
  }
  .task-list {
    @apply w-full flex flex-col gap-3;
  }
  .footer-wrapper {
    @apply fixed bottom-4 inset-x-4 max-w-md mx-auto z-20;
  }
  .footer-form {
    @apply relative w-full max-w-md mt-4;
  }
  .add-btn {
    @apply absolute inset-y-0 left-2 top-1/2 -translate-y-1/2 z-10;
  }
  .new-task-input {
    @apply w-full box-border pl-12 border-0 rounded-xl border pr-4 py-2 bg-white dark:bg-white focus:outline-none shadow;
  }
</style>
