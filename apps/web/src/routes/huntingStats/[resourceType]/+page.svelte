<script lang="ts">
	import { onMount } from 'svelte';
	import type { ResourceEntry, ResourceType } from '$lib/storage';
	import { loadResourceEntries } from '$lib/storage';
	import { resources } from '$lib/resources';
	import { chartRender } from '$lib/actions/chartRender.js';
	import { calculateStats } from '$lib/utils/statistics';
	import { buildDistanceHistogramData } from '$lib/utils/chartData';
	import { createResourceEntriesStore } from '$lib/stores/resourceEntriesStore.js';
	import { writable } from 'svelte/store';

	let stats: Record<string, any> = {};

	export let data; // kommt von load()
	const resourceType = writable<ResourceType>();
	// $: resourceType.set(data.resourceType as ResourceType);

	const entriesStore = createResourceEntriesStore(resourceType);
	resourceType.set(data.resourceType as ResourceType);

	// $: $entriesStore;
	$: if ($entriesStore){
		const rawStats = calculateStats($entriesStore);
		// console.log('rawStats', rawStats);
		stats = Object.fromEntries(
			Object.entries(rawStats).map(([typ, data]) => [
				typ,
				{
					...data,
					barData: buildDistanceHistogramData(data.allDistances)
				}
			])
		);
	}
	// export let barData;
	// onMount(() => {
	// 	const entries = loadResourceEntries(resourceType as ResourceType);
	// 	const rawStats = calculateStats(entries);
	// 	// Füge barData für jeden Typ hinzu
	// 	stats = Object.fromEntries(
	// 		Object.entries(rawStats).map(([typ, data]) => [
	// 			typ,
	// 			{
	// 				...data,
	// 				barData: buildDistanceHistogramData(data.allDistances)
	// 			}
	// 		])
	// 	);
	// });

	function getResourceName(resourceType: string, typ: string): string {
		const res = resources.find((r) => r.type === resourceType);
		if (!res) return typ;
		// typ entspricht "small", "medium", "large" → labels[typ] oder fallback
		return res.name + ' ' + (res.labels?.[typ] ?? typ);
	}
</script>

<h1 class="mb-6 text-center text-3xl font-bold">Hunting Stats</h1>

<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
	{#each Object.entries(stats) as [typ, data]}
		<div class="card bg-base-100 border-base-200 border shadow-xl">
			<div class="card-body items-center p-4 text-center">
				<h2 class="card-title mb-2 capitalize">{getResourceName(resourceType, typ)}</h2>
				<div class="mb-2 flex flex-wrap justify-center gap-2">
					<span class="badge badge-primary">Einträge: {data.count}</span>
					<span class="badge badge-secondary">Plüschis: {data.totalRareDrops}</span>
					<span class="badge badge-accent">Anteil: {data.share}</span>
				</div>
				<div class="divider my-2">Abstände</div>
				<div class="flex w-full flex-col gap-1">
					<!-- <div class="w-full flex justify-between items-start border border-base-content rounded px-3 py-1 text-sm bg-base-200">
						<span>Letzter Abstand</span>
						<span>{data.lastDistance}</span>
					</div> -->
					<div
						class="border-base-content bg-base-200 flex w-full items-start justify-between rounded border px-3 py-1 text-sm"
					>
						<span>Ø Abstand</span>
						<span>{data.avgDistance}</span>
					</div>
					<div
						class="border-base-content bg-base-200 flex w-full items-start justify-between rounded border px-3 py-1 text-sm"
					>
						<span>Letzte 10 Abstände</span>
						<span
							>{data.allDistances.length ? data.allDistances.slice(-10).join(' → ') : 'keine'}</span
						>
					</div>
					<div
						class="border-base-content bg-base-200 flex w-full items-start justify-between rounded border px-3 py-1 text-sm"
					>
						<span>Letzter Drop vor:</span>
						<span>{data.timeSinceLast}</span>
					</div>
					<div
						class="border-base-content bg-base-200 flex w-full items-start justify-between rounded border px-3 py-1 text-sm"
					>
						<canvas use:chartRender={data.barData}></canvas>
					</div>
				</div>
			</div>
		</div>
	{/each}
</div>

<div class="mt-8 text-center">
	<a href="/animals" class="btn btn-link">Zurück zur Erfassung</a>
</div>
