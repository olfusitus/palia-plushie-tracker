<script lang="ts">
    import type { PageData } from './$types';
    import { onMount } from 'svelte';

    let { data }: { data: PageData } = $props();

    let count = $state(0);

    function increment() {
        count++;
    }
    function decrement() {
        count--;
    }
</script>

<div class="flex flex-col items-center justify-center min-h-[60vh]">
    <div class="text-3xl font-bold mb-6">DaisyUI Counter</div>
    <div class="flex items-center gap-4">
        <button class="btn btn-circle btn-primary text-2xl" on:click={decrement} aria-label="decrement">-</button>
        <span class="text-4xl font-mono w-16 text-center">{count}</span>
        <button class="btn btn-circle btn-primary text-2xl" on:click={increment} aria-label="increment">+</button>
    </div>
</div>