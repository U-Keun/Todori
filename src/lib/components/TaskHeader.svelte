<script lang="ts">
    import type { Task } from '../types';
    import { createEventDispatcher } from 'svelte';
    import { ProgressBar, AddSubButton, InlineEditor, SubTask, TaskItem } from '$lib/components'
    import { navigateBack } from '$lib/stores/TaskStore';
    import { slide } from 'svelte/transition';
    import { tapHold } from '$lib/actions/tapHold';

    export let title: string;
    export let activeId: string | null;

    let childText = '';
    let isEditing = false;
    let editText = title;
    let subEditingId: string | null = null;
    let isMemoOpen = false;

    const dispatch = createEventDispatcher<{
        enter: { id: string };
        toggle: { id: string };
        edit: { id: string; text: string };
    }>();

    function onToggle() {
        dispatch('toggle', { id: activeId });
    }

    function confirmEdit() {
        if (editText.trim()) {
            dispatch('edit', { id: activeId, text: editText.trim() });
        }
        isEditing = false;
    }

    function cancelEdit() {
        isEditing = false;
        editText = title;
    }

    function toggleMemo() {
        console.log("hello");
        isMemoOpen = !isMemoOpen;
    }
</script>

<TaskItem>
    <svelte:fragment slot="leading">
        <button class="w-6 h-6 rounded border text-xs grid place-content-center bg-gray-200">
            ▾
        </button>
        {#if isEditing}   
            <InlineEditor
                initial={title}
                on:confirm={({ detail }) => { editText = detail; confirmEdit(); }}
                on:cancel={cancelEdit}
            />
        {:else}
            <span 
                class="flex-1 min-w-0 cursor-pointer truncate"
                use:tapHold={{ duration: 300 }}
                on:hold={toggleMemo}>
                {title}
            </span>
        {/if}
    </svelte:fragment>

    <svelte:fragment slot="trailing">
        <button on:click={onToggle} class="w-7 h-7 rounded-full border grid place-content-center hover:bg-yellow-300">
            ✔
        </button>
        <button on:click={navigateBack} class="w-7 h-7 rounded-full border grid place-content-center hover:bg-yellow-300">
            ↖︎
        </button>
    </svelte:fragment>

    <svelte:fragment slot="memo">
        {#if isMemoOpen}
            <div
                class="bg-gray-50 rounded-b-xl shadow-inner p-4 w-[calc(22/23*100%)] mx-auto mb-2"
                in:slide={{ duration: 200 }}
                out:slide={{ duration: 200 }}
            >
                <p class="text-sm text-gray-700 mb-0">{title}</p>
            </div>
        {/if}
    </svelte:fragment>
</TaskItem>
