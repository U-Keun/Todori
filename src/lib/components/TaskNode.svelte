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
        <button on:click={onExpand} class="w-6 h-6 rounded border text-xs grid place-content-center hover:bg-gray-200">
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
                class="flex-1 min-w-0 cursor-pointer truncate" 
                use:tapHold={{ duration: 300 }}
                on:hold={toggleMemo}
                on:tap={onEnter}>
                {task.title}
            </span>
        {/if}
    </svelte:fragment>
    <svelte:fragment slot="trailing">
        <ProgressBar progress={(task.completed ? 100 : (task.children.filter(c => c.completed).length / Math.max(1, task.children.length)) * 100)} done={task.completed} />
        <button on:click={onToggle} class="w-7 h-7 rounded-full border grid place-content-center hover:bg-yellow-300">
            ✔
        </button>
        <DropdownMenu items={mainMenuItems} />
    </svelte:fragment>

    <svelte:fragment slot="memo">
        {#if task.isMemoOpen}
            <div
                class="bg-gray-50 rounded-b-xl shadow-inner p-4 -mt-px w-[calc(22/23*100%)] mx-auto mb-2"
                in:slide={{ duration: 200 }}
                out:slide={{ duration: 200 }}
            >
                <p class="text-sm text-gray-700 mb-0">{task.title}</p>
            </div>
        {/if}
    </svelte:fragment>
    <svelte:fragment slot="handle">
        <div
            class="cursor-grab text-gray-400"
            data-dnd-handle
        >
            ⠿
        </div>
    </svelte:fragment>

    <svelte:fragment slot="sub-tasks">
        {#if task.isExpanded}
            <div class="relative pl-10 mt-2" transition:collapse>
                <div class="absolute top-0 left-6 w-px bg-gray-300 h-full"></div>
                <div class="flex flex-col gap-1.5">
                    {#each task.children as child (child.id)}
                        <SubTask
                            child={child}
                            on:subedit={({ detail }) => handleSubEdit(detail.id, detail.text)}
                            on:subtoggle={({ detail }) => handleSubToggle(detail.id)}
                            on:subremove={({ detail }) => handleSubRemove(detail.id)}
                        />
                    {/each}
                </div>
                <div class="relative h-10">
                    <div class="absolute inset-0 flex items-center">
                        <AddButton on:add={onAddChild} size="sm" shape="square" class="btn absolute left-2 top-1/2 -translate-y-1/2 shadow" />
                        <input
                            type="text"
                            placeholder="Add sub-task"
                            bind:value={childText}
                            class="w-full border-0 text-xs pr-4 py-1.5 pl-9 bg-white dark:bg-white rounded-xl focus:outline-none shadow"
                            on:keydown={e => e.key === 'Enter' && onAddChild()} />
                    </div>
                </div>
            </div>
        {/if}
    </svelte:fragment>
</TaskItem>
