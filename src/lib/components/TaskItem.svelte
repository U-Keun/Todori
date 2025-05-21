<script lang="ts">
    export let className: string = '';
</script>


<div class="flex flex-col gap-1">
    <div class={`rounded-xl bg-white dark:bg-white shadow font-sans text-gray-500 overflow-visible ${className}`}>
        <div class="flex items-center justify-between px-3 py-2 rounded-t-xl">
            <div class="flex-1 min-w-0 flex items-center gap-2">
                <slot name="leading" />
            </div>

            <div class="flex items-center gap-2">
                <slot name="trailing" />
            </div>
        </div>

        <slot name="memo" />
    </div>

    <slot name="sub-tasks" />
</div>
