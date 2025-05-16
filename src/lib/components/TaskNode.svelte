<script lang="ts">
    import type { Task } from '../types';
    import { createEventDispatcher } from 'svelte';

    import { ProgressBar, AddSubButton, DropdownMenu, InlineEditor, SubTask } from '$lib/components'
    import { makeMenuItems } from '$lib/helpers/menus';

    export let task: Task;
    export let depth: number = 0;

    let childText = '';
    let isEditing = false;
    let editText = task.title;
    let isExpanded = false;
    let subEditingId: string | null = null;

    const dispatch = createEventDispatcher<{
        enter: { id: string };
        toggle: { id: string };
        edit: { id: string; text: string };
        add: { parentId: string; text: string };
        remove: { id: string };
        expand: { id: string; expanded: boolean };
        subedit: { id: string; text: string };
        subtoggle: { id: string };
        subremove: { id: string };
    }>();

    function onEnter() {
        dispatch('enter', { id: task.id });
    }

    function onToggle() {
        dispatch('toggle', { id: task.id });
    }

    function startEdit() {
        isEditing = true;
        editText = task.title;
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

    function onExpand() {
        isExpanded = !isExpanded;
        dispatch('expand', { id: task.id, expanded: isExpanded });
    }

    function onAddChild() {
        if (childText.trim()) {
            dispatch('add', { parentId: task.id, text: childText.trim() });
            childText = '';
            isExpanded = true;
        }
    }

    function onRemove() {
        dispatch('remove', { id: task.id });
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

    const mainMenuItems = makeMenuItems(startEdit, onRemove);
</script>

<div class="flex flex-col gap-1" style="margin-left: {depth * 1.5}rem;">
    <div class="flex items-center justify-between gap-3 rounded-xl bg-white dark:bg-white px-3 py-2 shadow font-sans text-gray-500">
        <div class="flex items-center gap-2">
            <button on:click={onExpand} class="w-6 h-6 rounded border text-xs grid place-content-center hover:bg-gray-200">
                {isExpanded ? '▾' : '▸'}
            </button>

            {#if isEditing}
                <InlineEditor
                  initial={task.title}
                  on:confirm={({ detail }) => { editText = detail; confirmEdit(); }}
                  on:cancel={cancelEdit}
                />
            {:else}
                <span class:line-through={task.completed} class:text-gray-400={task.completed} class="cursor-pointer" on:click={onEnter}>
                  {task.title}
                </span>
            {/if}
        </div>
        <div class="flex items-center gap-2">
            <ProgressBar progress={(task.completed ? 100 : (task.children.filter(c => c.completed).length / Math.max(1, task.children.length)) * 100)} done={task.completed} />
            <button on:click={onToggle} class="w-7 h-7 rounded-full border grid place-content-center hover:bg-yellow-300">
                ✔
            </button>
            <DropdownMenu items={mainMenuItems} />
        </div>
    </div>

    {#if isExpanded}
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
                    <AddSubButton on:add={onAddChild} class="absolute left-2 top-1/2 -translate-y-1/2 z-10 shadow" />
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
</div>
