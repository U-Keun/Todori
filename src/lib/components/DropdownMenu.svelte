<script lang="ts">
    import { clickOutside } from '$lib/actions/clickOutside';
    import { fade } from 'svelte/transition';

    export let items: { label: string; action: () => void }[];

    let open = false;
    function toggleMenu() {
        open = !open;
    }

    function select(item: { label: string; action: () => void }) {
        item.action();
        open = false;
    }
</script>

<div class="dropdown" use:clickOutside on:outclick={() => open = false}>
    <slot name="trigger">
        <button on:click={toggleMenu} class="trigger-btn">⋮</button>
    </slot>

    {#if open}
        <div class="menu" transition:fade>
            {#each items as item}
                <button
                    on:click={() => select(item)}
                    class="menu-item">
                    {item.label}
                </button>
            {/each}
        </div>
    {/if}
</div>

<style lang="postcss">
    .dropdown {
        @apply relative inline-block;
    }
    .trigger-btn {
        @apply w-7 h-7 grid place-content-center text-zinc-500 hover:text-gray-500;
    }
    .menu {
        @apply absolute right-0 mt-1 w-32 bg-white dark:bg-white border rounded shadow-lg z-20;
    }
    .menu-item {
        @apply block w-full text-left px-4 py-2 text-sm hover:bg-gray-100;
    }
</style>
