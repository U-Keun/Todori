<script lang="ts">
    export let progress: number;
    export let done: boolean;
</script>

<div class="w-24 h-2 bg-gray-200 rounded overflow-hidden mt-1">
    <div 
        class="h-full transition-all duration-500"
        class:bg-yellow-400={!done}
        class:bg-green-300={done}
        style="width: {progress}%"
    ></div>
</div>
