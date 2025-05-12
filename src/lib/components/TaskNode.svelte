<script lang="ts">
    import type { Task } from '../types';
    import { tasks } from '../stores/TaskStore';

    import { TaskNode, ProgressBar, AddSubButton, DropdownMenu, InlineEditor, SubTask } from '$lib/components'
    import { makeMenuItems } from '$lib/helpers/menus';

    export let task: Task;
    export let depth: number = 0;

    let localCompleted = task.completed;
    let childText = '';
    let isEditing = false;
    let editText = task.title;
    let subEditingId: string | null = null;

    $: isExpanded = task.isExpanded;

    function onToggleComplete() {
        tasks.toggleComplete(task.id);
        localCompleted = !localCompleted;
    }

    function onToggleExpand() {
        tasks.toggleExpand(task.id);
    }

    function startEdit() {
        editText = task.title;
        isEditing = true;
    }

    function confirmEdit() {
        if (editText.trim()) {
            tasks.updateText(task.id, editText.trim())
        }
        isEditing = false;
    }

    function cancelEdit() {
        isEditing = false;
        editText = task.title;
    }

    function addChild() {
        if (childText.trim()) {
            tasks.addTask(childText.trim(), task.id);
            childText = '';
        }
    }

    function handleSubStartEdit(id: string, text: string) {
        subEditingId = id;
        editText = text;
    }

    function handleSubConfirm(id: string, newText: string) {
        tasks.updateSubText(id, newText);
        subEditingId = null;
    }

    function handleSubCancel() {
        subEditingId = null;
    }

    function handleSubToggle(id: string) {
        tasks.toggleComplete(id);
    }

    function handleSubRemove(parentId: string, childId: string) {
        tasks.removeSubTask(parentId, childId);
    }

    function removeTask() {
        tasks.removeTask(task.id);
    }

    $: progress = localCompleted
        ? 100
        : (task.children.filter(c => c.completed).length / Math.max(1, task.children.length)) * 100;

    function collapse(node: HTMLElement, { duration = 200 } = {}) {
    const height = node.scrollHeight;
    return {
      duration,
      css: (t: number) => `
        overflow: hidden;
        height: ${t * height}px;
        opacity: ${t};
      `
    };
    }

    const mainMenuItems = makeMenuItems(startEdit, removeTask);
</script>

<div class="flex flex-col gap-1" style="margin-left: {depth * 1.5}rem;">
    <div class="flex items-center justify-between gap-3 rounded-xl bg-white dark:bg-white px-3 py-2 shadow font-sans text-gray-500">
        <div class="flex items-center gap-2">
            <button on:click={onToggleExpand} class="w-6 h-6 rounded border text-xs grid place-content-center hover:bg-gray-200">
                {isExpanded ? '▾' : '▸'}
            </button>

            {#if isEditing}
                <InlineEditor
                  initial={task.title}
                    on:confirm={({ detail }) => { editText = detail; confirmEdit(); }}
                  on:cancel={cancelEdit}
                />
            {:else}
                <span class:line-through={localCompleted} class:text-gray-400={localCompleted}>
                  {task.title}
                </span>
            {/if}
        </div>
        <div class="flex items-center gap-2">
            <ProgressBar {progress} done={localCompleted} />
            <button on:click={onToggleComplete} class="w-7 h-7 rounded-full border grid place-content-center hover:bg-yellow-300">
                ✔
            </button>
            <DropdownMenu items={mainMenuItems} />
        </div>
    </div>

    {#if isExpanded}
        <div class="relative pl-10 mt-2" transition:collapse>
            <div class="absolute top-0 left-6 w-px bg-gray-300 h-full"></div>
            <div class="flex flex-col gap-1.5">
                {#each task.children as child (child.id)}
                    <SubTask
                        child={child}
                        parentId={task.id}
                        subEditingId={subEditingId}
                        onConfirm={handleSubConfirm}
                        onCancel={handleSubCancel}
                        onToggle={handleSubToggle}
                        onStartEdit={handleSubStartEdit}
                        onRemove={handleSubRemove}
                    />
                {/each}
            </div>
            <div class="relative h-10">
                <div class="absolute inset-0 flex items-center">
                    <AddSubButton on:add={addChild} class="absolute left-2 top-1/2 -translate-y-1/2 z-10 shadow" />
                    <input
                        type="text"
                        placeholder="Add sub-task"
                        bind:value={childText}
                        class="w-full border-0 text-xs pr-4 py-1.5 pl-9 bg-white dark:bg-white rounded-xl focus:outline-none shadow"
                        on:keydown={e => e.key === 'Enter' && addChild()} />
                </div>
            </div>
        </div>
    {/if}
</div>
