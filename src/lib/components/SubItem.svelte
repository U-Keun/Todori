<script lang="ts">
    import { InlineEditor, DropdownMenu } from '$lib/components';
    import { makeMenuItems } from '$lib/helpers/menus';

    export let sub;
    export let subEditingId;
    export let subEditText;
    export let onConfirm;
    export let onCancel;
    export let onToggle;
    export let onRemove;
    export let onStartEdit;
</script>

<div class="flex items-center justify-between gap-2 rounded-xl bg-white dark:bg-white px-3 py-0.5 shadow font-sans text-gray-500">
    {#if subEditingId === sub.id}
        <InlineEditor
            initial={sub.text}
            on:confirm={(e) => onConfirm(sub.id, e.detail)}
            on:cancel={onCancel} />
    {:else}
        <span class="text-sm" class:line-through={sub.done} class:text-zinc-400={sub.done}>
            {sub.text}
        </span>
    {/if}

    <div class="flex items-center gap-2">
        <button title="toggle sub-todo" on:click={ () => todos.toggle(sub.id) } 
                class:bg-yellow-200={sub.done} class:text-white={sub.done} class:text-gray-400={!sub.done}
                class="w-6 h-6 rounded border text-xs grid place-content-center hover:bg-yellow-300 hover:text-white">
                ✔
        </button>
        <DropdownMenu items={makeMenuItems(
                      () => onStartEdit(sub.id, sub.text),
                      () => onRemove(todo.id, sub.id))} />
    </div>
</div>
