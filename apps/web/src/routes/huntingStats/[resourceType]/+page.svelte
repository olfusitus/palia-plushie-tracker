<script lang="ts">
	import { onMount } from 'svelte';
	import type { AnimalEntry, ResourceType } from '$lib/storage/types';
	import { resources } from '$lib/resources';
	import { chartRender } from '$lib/actions/chartRender';
	import { calculateAnimalStats } from '$lib/utils/statistics';
	import { buildDistanceHistogramData } from '$lib/utils/chartData';
	import { resourceStore } from '$lib/stores/resourceStore';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let stats: Record<string, any> = {};

	export let data; // kommt von load()
	const resourceType: ResourceType = data.resourceType as ResourceType;

	// ensure Data is loaded into the store
	onMount(() => {
		resourceStore.ensureLoaded(resourceType);
	});

	$: entries = $resourceStore[resourceType] || ([] as AnimalEntry[]);

	$: stats = Object.fromEntries(
		Object.entries(calculateAnimalStats(entries as AnimalEntry[])).map(([typ, data]) => [
			typ,
			{ ...data, barData: buildDistanceHistogramData(data.allDistances) }
		])
	);

	function getResourceName(resourceType: string, typ: string): string {
		const res = resources.find((r) => r.type === resourceType);
		if (!res) return typ;
		// typ entspricht "small", "medium", "large" → labels[typ] oder fallback
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return res.name + ' ' + ((res as any)?.labels?.[typ] ?? typ);
	}
</script>

<h1 class="mb-6 text-center text-3xl font-bold">Hunting Stats</h1>

<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
	{#each Object.entries(stats) as [typ, data] (typ)}
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
						<span>Geringster Abstand</span>
						<span>{data.lowestDistance}</span>
					</div>
					<div
						class="border-base-content bg-base-200 flex w-full items-start justify-between rounded border px-3 py-1 text-sm"
					>
						<span>Höchster Abstand</span>
						<span>{data.highestDistance}</span>
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
