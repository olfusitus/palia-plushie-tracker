<script lang="ts">
	import { onMount } from 'svelte';
	import type { ResourceEntry, ResourceType } from '$lib/storage';
	import { loadData } from '$lib/storage';

	let stats: Record<string, any> = {};

    export let data;            // kommt von load()
    $: resourceType = data.resourceType;

	onMount(() => {
		const data = loadData(resourceType as ResourceType);
		const grouped = { small: [], medium: [], large: [] } as Record<string, number[]>;

		data.forEach((e: ResourceEntry) => {
			grouped[e.type].push(e.rareDrops);
		});

		stats = Object.fromEntries(
			Object.entries(grouped).map(([typ, werte]) => {
				const count = werte.length;
				const avg = count ? (werte.reduce((a, b) => a + b, 0) / count).toFixed(2) : '–';
				const dist = [0, 1, 2, 3].reduce(
					(acc, g) => {
						acc[g] = werte.filter((w) => w === g).length;
						return acc;
					},
					{} as Record<number, number>
				);
				return [typ, { count, avg, dist }];
			})
		);
	});
</script>

<h1 class="mb-6 text-center text-2xl font-bold">Statistik</h1>

<div class="grid grid-cols-1 gap-4 text-center md:grid-cols-3">
	{#each Object.entries(stats) as [typ, data]}
		<div class="rounded bg-white p-4 shadow">
			<h2 class="mb-2 text-lg font-semibold">
				{typ.charAt(0).toUpperCase() + typ.slice(1)} Ore
			</h2>
			<p><strong>Einträge:</strong> {data.count}</p>
			<p><strong>Ø Gold:</strong> {data.avg}</p>
			<div class="mt-2 text-sm">
				{#each Object.entries(data.dist) as [g, v]}
					<p>{g} Gold: {v}</p>
				{/each}
			</div>
		</div>
	{/each}
</div>

<div class="mt-8 text-center">
	<a href="/" class="text-blue-700 underline">Zurück zur Erfassung</a>
</div>
