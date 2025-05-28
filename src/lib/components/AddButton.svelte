<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let size: 'md' | 'sm' = 'md';
    export let shape: 'round' | 'square' = 'round';

    const dispatch = createEventDispatcher();
    function click() { dispatch('add'); }
</script>

<button 
    on:click={click} 
    {...$$restProps}
    class="btn {size} {shape} {$$restProps.class}">
    <span class="icon {size}">＋</span>
</button>

<style lang="postcss">
    .btn {
        @apply bg-yellow-200 hover:bg-yellow-300 
        text-white grid place-content-center 
        shadow-lg;
    }
    .icon {
        @apply font-sans;
    }

    .btn.md { @apply w-7 h-7; }
    .btn.sm { @apply w-5 h-5; }

    .btn.round { @apply rounded-full; }
    .btn.square { @apply rounded; }

    .icon.md { @apply text-xl; }
    .icon.sm { @apply text-base; }
</style>
