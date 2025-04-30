<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    function click() { dispatch('add'); }
</script>

<button 
    on:click={click} 
    {...$$restProps}
    class={`w-5 h-5 rounded bg-yellow-200 hover:bg-yellow-300 text-white grid place-content-center shadow-lg 
        ${$$restProps.class ?? ""}`}>
    <span class="text-base font-sans">＋</span>
</button>
