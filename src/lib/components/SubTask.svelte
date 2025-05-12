<script lang="ts">
    import { InlineEditor, DropdownMenu } from '$lib/components';
    import { makeMenuItems } from '$lib/helpers/menus';

    export let child;
    export let parentId;
    export let subEditingId;
    export let onConfirm;
    export let onCancel;
    export let onToggle;
    export let onRemove;
    export let onStartEdit;
</script>

<div class="flex items-center justify-between gap-2 rounded-xl bg-white dark:bg-white px-3 py-0.5 shadow font-sans text-gray-500">
    {#if subEditingId === child.id}
        <InlineEditor
            initial={child.title}
            on:confirm={(e) => onConfirm(child.id, e.detail)}
            on:cancel={onCancel} />
    {:else}
        <span class="text-sm" class:line-through={child.completed} class:text-zinc-400={child.completed}>
            {child.title}
        </span>
    {/if}

    <div class="flex items-center gap-2">
        <button title="toggle sub-task" on:click={ () => onToggle(child.id) } 
                class:bg-yellow-200={child.completed} class:text-white={child.completed} class:text-gray-400={!child.completed}
                class="w-6 h-6 rounded border text-xs grid place-content-center hover:bg-yellow-300 hover:text-white">
                ✔
        </button>
        <DropdownMenu items={makeMenuItems(
                      () => onStartEdit(child.id, child.title),
                      () => onRemove(parentId, child.id))} />
    </div>
</div>
