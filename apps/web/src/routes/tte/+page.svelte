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

<div class="flex min-h-[60vh] flex-col items-center justify-center">
	<div class="mb-6 text-3xl font-bold">DaisyUI Counter</div>
	<div class="flex items-center gap-4">
		<button class="btn btn-circle btn-primary text-2xl" on:click={decrement} aria-label="decrement"
			>-</button
		>
		<span class="w-16 text-center font-mono text-4xl">{count}</span>
		<button class="btn btn-circle btn-primary text-2xl" on:click={increment} aria-label="increment"
			>+</button
		>
	</div>
</div>
