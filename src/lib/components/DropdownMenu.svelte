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

<div class="relative" use:clickOutside on:outclick={() => open = false}>
    <slot name="trigger">
        <button on:click={toggleMenu} class="w-7 h-7 grid place-content-center text-zinc-500 hover:text-black-500">
            ⋮
        </button>
    </slot>

    {#if open}
        <div class="absolute right-0 mt-1 w-32 bg-white dark:bg-white border rounded shadow-lg z-20" transition:fade>
            {#each items as item}
                <button
                    on:click={() => select(item)}
                    class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                    {item.label}
                </button>
            {/each}
        </div>
    {/if}
</div>
