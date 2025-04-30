<script lang="ts">
    import { todos, type Todo } from '$lib/stores/todos';
    import { createEventDispatcher } from 'svelte';
    import { ProgressBar, AddSubButton, DropdownMenu, InlineEditor, SubItem } from '$lib/components';
    import { makeMenuItems } from '$lib/helpers/menus';

    export let todo: Todo;

    let localDone = todo.done;
    let subTodoText = "";

    $: subVisible = todo.isOpen ?? false;

    let isEditing = false;
    let editText = todo.text;

    let subEditingId: string | null = null;

    const dispatch = createEventDispatcher();

    function toggleDone() {
        todos.toggle(todo.id);
        localDone = !localDone;
    }

    function startEdit() {
        editText = todo.text;
        isEditing = true;
    }

    function confirmEdit() {
        if (editText.trim()) {
            todos.updateText
                ? todos.updateText(todo.id, editText.trim())
                : dispatch('edit', { id: todo.id, text: editText.trim() });
        }
        isEditing = false;
    }

    function cancelEdit() {
        isEditing = false;
        editText = todo.text;
    }

    function toggleOpen() {
        todos.setIsOpen(todo.id, !subVisible);
    }

    function startEditSub(subId: string, text: string) {
        subEditingId = subId;
    }

    function confirmEditSub(subId: string, newText: string) {
        if (newText.trim()) {
            todos.updateSubText
                ? todos.updateSubText(todo.id, subId, newText.trim())
                : dispatch('editSub', { parentId: todo.id, subId, text: newText.trim() });
        }
        subEditingId = null;
    }

    function cancelEditSub() {
        subEditingId = null;
    }

    function addSubTodo() {
        if (subTodoText.trim()) {
            todos.addSubTodo(todo.id, subTodoText);
            subTodoText = "";
        }
    }

    const remove = () => todos.remove(todo.id);

    $: progress = localDone
        ? 100
        : ((todo.subTodos?.filter(s => s.done).length ?? 0)
            / Math.max(1, todo.subTodos?.length ?? 0))
            * 100;

    function collapse(node: HTMLElement, { duration = 250 } = {}) {
        const height = node.scrollHeight;
        return {
            duration,
            css: (t: number) => `
                overflow: hidden;
                height: ${t * height}px;
                opacity: ${t}
            `
        };
    }

    const mainMenuItems = makeMenuItems(startEdit, remove);
</script>

<div class="flex flex-col gap-1">
    <div class="flex items-center justify-between gap-3 rounded-xl bg-white dark:bg-white px-3 py-2 shadow font-sans text-gray-500">
        <div class="flex items-center gap-2">
            <button title="toggle sub-todo" on:click={toggleOpen}
                    class="w-6 h-6 rounded border text-xs grid place-content-center hover:bg-gray-200">
                    {subVisible ? '▾' : '▸'}
            </button>

            {#if isEditing}
                <InlineEditor
                    initial={todo.text}
                    on:confirm={(e) => { editText = e.detail; confirmEdit(); }}
                    on:cancel={cancelEdit}
                />
            {:else}
                <span class:line-through={localDone} class:text-zinc-400={localDone}>
                    {todo.text}
                </span>    
            {/if}
        </div>
        
        <div class="flex items-center gap-2">
            <ProgressBar {progress} done={localDone} />

            <button title="done" on:click={toggleDone} 
                    class:bg-yellow-200={localDone} class:text-white={localDone}
                    class="w-7 h-7 rounded-full border grid place-content-center hover:bg-yellow-300 hover:text-white">
                ✔
            </button>
            <DropdownMenu items={mainMenuItems} />
        </div>
    </div>

    {#if subVisible}
        <div class="relative pl-10 mt-2" 
             transition:collapse={{ duration: 200 }}>
            <div class="absolute top-0 left-6 w-px bg-gray-300 h-full"></div>

            <div class="flex flex-col gap-1.5">
                {#each todo.subTodos as sub (sub.id)}
                    <SubItem {sub} {subEditingId} onStartEdit={startEditSub}
                        onConfirm={confirmEditSub} onCancel={cancelEditSub}
                        onToggle={(id) => todos.toggle(id)} onRemove={(id) => todos.removeSubTodo(todo.id, id)} />
                {/each}
            </div>

            <div class="relative h-10">
                <div class="absolute inset-0 flex items-center">
                    <AddSubButton
                        on:add={addSubTodo}
                        class="absolute left-2 top-1/2 -translate-y-1/2 z-10 shadow" />
                    <input type="text"
                           placeholder="new sub-ToDo"
                           bind:value={subTodoText}
                           class="w-full border-0 rounded-xl border text-xs pr-4 py-1.5 pl-9 bg-white dark:bg-white focus:outline-none shadow"
                           on:keydown={ (e) => { if (e.key === 'Enter') addSubTodo(); }}
                    />
                </div>
            </div>
        </div>
    {/if}
</div>
