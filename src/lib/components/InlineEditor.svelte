<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    export let initial = '';
    export let onConfirm: (value: string) => void;
    export let onCancel: () => void;

    let value = initial;
    const dispatch = createEventDispatcher();

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter') dispatch('confirm', value);
        if (e.key === 'Escape') dispatch('cancel');
    }

    onMount(() => {
        const input = document.querySelector('input');
        input && (input as HTMLInputElement).focus();
    });
</script>

<input
    bind:value
    class="border rounded px-2 py-1 text-sm w-full"
    on:keydown={handleKeydown}
    on:blur={() => dispatch('confirm', value)}
/>
