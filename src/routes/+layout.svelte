<script lang="ts">
	import '../app.css';
	let { children } = $props();

	import { onMount } from 'svelte';
	import { migratePaliaData } from '$lib/utils/migration';

	onMount(() => {
		migratePaliaData();
	});
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-100 via-sky-100 to-blue-200 bg-fixed">
	<div class="flex flex-col items-center justify-start px-4 py-8">
		<nav class="mb-8 flex space-x-4 rounded-lg bg-white/70 p-4 shadow-md backdrop-blur-md">
			<a href="/">Home</a>
			<a href="/ores/ore_gold">Gold</a>
			<a href="/ores/ore_silver">Silber</a>
			<a href="/animals">Tierchen</a>
		</nav>

		{@render children()}
	</div>
</div>
