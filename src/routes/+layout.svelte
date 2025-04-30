<script lang="ts">
    import "../app.css";
    import { onMount, onDestroy } from 'svelte';
    import { invoke } from '@tauri-apps/api/core';
    import { debounce } from 'lodash-es';
    import { todos, type Todo } from '$lib/stores/todos';

    onMount(async () => {
        try {
            const data: Todo[] = await invoke('load_todos');
            todos.set(data);
        } catch (e) {
            console.error('로드 실패', e);
        }

        const saveDebounced = debounce((items: Todo[]) => {
            invoke('save_todos', { items }).catch(e => console.error('저장 실패', e));
        }, 300);

        const unsub = todos.subscribe(saveDebounced);

    });

    onDestroy(() => unsub());
</script>

<slot></slot>
