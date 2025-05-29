<script lang="ts">
    import type { Task } from '../types';
    import { createEventDispatcher } from 'svelte';
    import { ProgressBar, AddButton, DropdownMenu, InlineEditor, SubTask, TaskItem } from '$lib/components'
    import { makeMenuItems } from '$lib/helpers/menus';
    import { activeTaskId, navigateTo, navigateBack } from '$lib/stores/TaskStore';
    import { slide } from 'svelte/transition';
    import { tapHold } from '$lib/actions/tapHold';

    export let task: Task;

    let childText = '';
    let isEditing = false;
    let editText = task.title;
    let subEditingId: string | null = null;

    const dispatch = createEventDispatcher<{
        toggle: { id: string };
        edit: { id: string; text: string };
        add: { parentId: string; text: string };
        remove: { id: string };
        subedit: { id: string; text: string };
        subtoggle: { id: string };
        subremove: { id: string };
    }>();

    const mainMenuItems = makeMenuItems(
        () => { isEditing = true; editText = task.title; },
        () => dispatch('remove', { id: task.id }),
    );

    function onEnter() {
        navigateTo(task.id);
    }

    function onToggle() {
        dispatch('toggle', { id: task.id });
    }

    function confirmEdit() {
        if (editText.trim()) {
            dispatch('edit', { id: task.id, text: editText.trim() });
        }
        isEditing = false;
    }

    function cancelEdit() {
        isEditing = false;
        editText = task.title;
    }

    function onAddChild() {
        if (!childText.trim()) return;
        dispatch('add', { parentId: task.id, text: childText.trim() });
        childText = '';
        task.isExpanded = true;
    }

    function handleSubEdit(id: string, text: string) {
        dispatch('subedit', { id, text });
        subEditingId = null;
    }

    function handleSubToggle(id: string) {
        dispatch('subtoggle', { id });
    }

    function handleSubRemove(id: string) {
        dispatch('subremove', { id });
    }

    function startSubEdit(id: string, text: string) {
        subEditingId = id;
        editText = text;
    }

    function collapse(node: HTMLElement, { duration = 200 } = {}) {
        const height = node.scrollHeight;
        return {
          duration,
          css: (t: number) => `
            overflow: hidden;
            height: ${t * height}px;
            opacity: ${t};
          `
        };
    }

    function onExpand() {
        task.isExpanded = !task.isExpanded;
    }

    function toggleMemo() {
        task.isMemoOpen = !task.isMemoOpen;
    }
</script>


<TaskItem>
    <svelte:fragment slot="leading">
        <button on:click={onExpand} class="expand-btn">
            {task.isExpanded ? '▾' : '▸'}
        </button>
        {#if isEditing}   
            <InlineEditor
                initial={task.title}
                on:confirm={({ detail }) => { editText = detail; confirmEdit(); }}
                on:cancel={cancelEdit}
            />
        {:else}
            <span 
                class:line-through={task.completed} 
                class:text-gray-400={task.completed || task.isMemoOpen} 
                class="title-span" 
                use:tapHold={{ duration: 300 }}
                on:hold={toggleMemo}
                on:tap={onEnter}>
                {task.title}
            </span>
        {/if}
    </svelte:fragment>
    <svelte:fragment slot="trailing">
        <ProgressBar progress={(task.completed ? 100 : (task.children.filter(c => c.completed).length / Math.max(1, task.children.length)) * 100)} done={task.completed} />
        <button on:click={onToggle} class="action-btn">
            ✔
        </button>
        <DropdownMenu items={mainMenuItems} />
    </svelte:fragment>

    <svelte:fragment slot="memo">
        {#if task.isMemoOpen}
            <div
                class="memo-container"
                in:slide={{ duration: 200 }}
                out:slide={{ duration: 200 }}
            >
                <p class="memo-text">{task.title}</p>
            </div>
        {/if}
    </svelte:fragment>
    <svelte:fragment slot="handle">
        <div
            class="handle-grab"
            data-dnd-handle
        >
            ⠿
        </div>
    </svelte:fragment>

    <svelte:fragment slot="sub-tasks">
        {#if task.isExpanded}
            <div class="subtasks-wrapper" transition:collapse>
                <div class="divider-line"></div>
                <div class="subtasks-list">
                    {#each task.children as child (child.id)}
                        <SubTask
                            child={child}
                            on:subedit={({ detail }) => handleSubEdit(detail.id, detail.text)}
                            on:subtoggle={({ detail }) => handleSubToggle(detail.id)}
                            on:subremove={({ detail }) => handleSubRemove(detail.id)}
                        />
                    {/each}
                </div>
                <div class="subtask-add-container">
                    <div class="subtask-add-inner">
                        <AddButton on:add={onAddChild} size="sm" shape="square" class="btn absolute left-2 top-1/2 -translate-y-1/2 shadow" />
                        <input
                            type="text"
                            placeholder="Add sub-task"
                            bind:value={childText}
                            class="subtask-input"
                            on:keydown={e => e.key === 'Enter' && onAddChild()} />
                    </div>
                </div>
            </div>
        {/if}
    </svelte:fragment>
</TaskItem>

<style lang="postcss">
  .expand-btn {
    @apply w-6 h-6 rounded border text-xs grid place-content-center hover:bg-gray-200;
  }
  .title-span {
    @apply flex-1 min-w-0 cursor-pointer truncate;
  }
  .action-btn {
    @apply w-7 h-7 rounded-full border grid place-content-center hover:bg-yellow-300;
  }
  .memo-container {
    @apply bg-gray-50 rounded-b-xl shadow-inner p-4 -mt-px w-[calc(22/23*100%)] mx-auto mb-2;
  }
  .memo-text {
    @apply text-sm text-gray-700 mb-0;
  }
  .handle-grab {
    @apply cursor-grab text-gray-400;
  }
  .subtasks-wrapper {
    @apply relative pl-10 mt-2;
  }
  .divider-line {
    @apply absolute top-0 left-6 w-px bg-gray-300 h-full;
  }
  .subtasks-list {
    @apply flex flex-col gap-1.5;
  }
  .subtask-add-container {
    @apply relative h-10;
  }
  .subtask-add-inner {
    @apply absolute inset-0 flex items-center;
  }
  .add-btn-container {
    @apply absolute left-2 top-1/2 -translate-y-1/2 shadow;
  }
  .subtask-input {
    @apply w-full border-0 text-xs pr-4 py-1.5 pl-9 bg-white dark:bg-white rounded-xl focus:outline-none shadow;
  }
</style>

