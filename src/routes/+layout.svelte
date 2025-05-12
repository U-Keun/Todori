<script lang="ts">
    import "../app.css";
    import { onMount, onDestroy } from 'svelte';
    import { invoke } from '@tauri-apps/api/core';
    import { debounce } from 'lodash-es';
    import { tasks, type Task } from '$lib/stores/TaskStore';

    onMount(async () => {
        try {
            const data: Task[] = await invoke('load_tasks');
            tasks.set(data);
        } catch (e) {
            console.error('로드 실패', e);
        }

        const saveDebounced = debounce((items: Todo[]) => {
            invoke('save_tasks', { items }).catch(e => console.error('저장 실패', e));
        }, 300);

        const unsub = tasks.subscribe(saveDebounced);

    });

    onDestroy(() => unsub());
</script>

<slot></slot>
