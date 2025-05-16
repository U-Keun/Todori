<script lang="ts">
    import type { Task } from '../types';
    import { createEventDispatcher } from 'svelte';
    import { InlineEditor, DropdownMenu } from '$lib/components';
    import { makeMenuItems } from '$lib/helpers/menus';

    export let child: Task;

    let isEditing = false;
    let editText = child.title;

    const dispatch = createEventDispatcher<{
        subedit: { id: string; text: string };
        subtoggle: { id: string };
        subremove: { id: string };
    }>();

    function startEdit() {
        isEditing = true;
        editText = child.title;
    }

    function confirmEdit() {
        if (editText.trim()) {
            dispatch('subedit', { id: child.id, text: editText.trim() });
        }
        isEditing = false;
    }

    function cancelEdit() {
        isEditing = false;
        editText = child.title;
    }

    function onToggle() {
        dispatch('subtoggle', { id: child.id });
    }

    function onRemove() {
        dispatch('subremove', { id: child.id });
    }

    const menuItems = makeMenuItems(startEdit, onRemove);
</script>

<div class="flex items-center justify-between gap-2 rounded-xl bg-white dark:bg-white px-3 py-0.5 shadow font-sans text-gray-500">
    {#if isEditing}
        <InlineEditor
            initial={child.title}
            on:confirm={({ detail }) => { editText = detail; confirmEdit(); }}
            on:cancel={cancelEdit} />
    {:else}
        <span class="text-sm" class:line-through={child.completed} class:text-zinc-400={child.completed}>
            {child.title}
        </span>
    {/if}

    <div class="flex items-center gap-2">
        <button title="toggle sub-task" on:click={onToggle} 
                class:bg-yellow-200={child.completed} class:text-white={child.completed} class:text-gray-400={!child.completed}
                class="w-6 h-6 rounded border text-xs grid place-content-center hover:bg-yellow-300 hover:text-white">
                ✔
        </button>
        <DropdownMenu items={menuItems} />
    </div>
</div>
