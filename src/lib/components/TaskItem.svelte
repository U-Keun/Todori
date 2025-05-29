<script lang="ts">
    export let className: string = '';
</script>

<div class="task-item">
    <div class="content-wrapper">
        <div class="container {className}">
            <div class="header">
                <div class="leading">
                    <slot name="leading" />
                </div>

                <div class="trailing">
                    <slot name="trailing" />
                </div>
            </div>

            <slot name="memo" />
        </div>

        <slot name="sub-tasks" />
    </div>
    <div class="handle">
        <slot name="handle" />
    </div>
</div>

<style lang="postcss">
    .task-item {
        @apply flex items-start max-w-md gap-2;
    }
    .content-wrapper {
        @apply flex-1 min-w-0 flex flex-col gap-2;
    }
    .container {
        @apply flex-1 rounded-xl bg-white dark:bg-white
            shadow font-sans text-gray-500 overflow-visible;
    }
    .header {
        @apply flex items-center justify-between
            px-3 py-2 rounded-t-xl min-w-0;
    }
    .leading {
        @apply flex items-center gap-2 min-w-0;
    }
    .trailing {
        @apply flex items-center gap-2;
    }
    .handle {
        @apply self-center;
    }
</style>
