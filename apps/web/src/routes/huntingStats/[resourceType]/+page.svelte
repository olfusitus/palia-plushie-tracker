<script lang="ts">
	import { onMount } from 'svelte';
	import type { AnimalEntry, ResourceType } from '$lib/storage/types';
	import { resources } from '$lib/resources';
	import { chartRender } from '$lib/actions/chartRender';
	import { calculateAnimalStats, type StatResult } from '$lib/utils/statistics';
	import { buildDistanceHistogramData } from '$lib/utils/chartData';
	import { resourceStore } from '$lib/stores/resourceStore';
	import { _ } from 'svelte-i18n';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let stats: Record<string, StatResult & { barData: ReturnType<typeof buildDistanceHistogramData> }> = {};

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
		return $_(`resources.${res.type}.name`) + ' ' + $_(`resources.${res.type}.labels.${typ}`);
		// ((res as any)?.labels?.[typ] ?? typ);
	}
</script>

<h1 class="mb-6 text-center text-3xl font-bold">🐾 {$_(`stats.title_animal`)}</h1>

<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
	{#each Object.entries(stats) as [typ, data] (typ)}
		<div class="card bg-base-100 border-base-200 border shadow-xl">
			<div class="card-body items-center p-4 text-center">
				<h2 class="card-title mb-2 capitalize">{getResourceName(resourceType, typ)}</h2>
				<div class="mb-2 flex flex-wrap justify-center gap-2">
					<span class="badge badge-primary">{$_(`stats.entries`)}: {data.count}</span>
					<span class="badge badge-secondary">{$_(`stats.plushies`)}: {data.totalRareDrops}</span>
					<span class="badge badge-accent">{$_(`stats.share`)}: {data.share}</span>
				</div>
				<div class="divider my-2">{$_(`stats.distances`)}</div>
				<div class="flex w-full flex-col gap-1">
					<!-- <div class="w-full flex justify-between items-start border border-base-content rounded px-3 py-1 text-sm bg-base-200">
						<span>Letzter Abstand</span>
						<span>{data.lastDistance}</span>
					</div> -->
					<div
						class="border-base-content bg-base-200 flex w-full items-start justify-between rounded border px-3 py-1 text-sm"
					>
						<span>{$_(`stats.avg_distance`)}</span>
						<span>{data.avgDistance?.toFixed(2)}</span>
					</div>
					<div class="flex w-full gap-1">
						<div
							class="border-base-content bg-base-200 flex flex-1 items-start justify-between rounded border px-3 py-1 text-sm"
						>
							<!-- <span>{$_(`stats.lowest_distance`)}</span> -->
							<span>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
									<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5" />
							  	</svg>
							</span>
							<span>{data.lowestDistance}</span>
						</div>
						<div
							class="border-base-content bg-base-200 flex flex-1 items-start justify-between rounded border px-3 py-1 text-sm"
						>
							<!-- <span>{$_(`stats.highest_distance`)}</span> -->
							<span>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
									<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 18.75 7.5-7.5 7.5 7.5" />
									<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 7.5-7.5 7.5 7.5" />
								</svg> 
							</span>
							<span>
								{data.highestDistance > data.timeSinceLast
									? data.highestDistance
									: data.timeSinceLast}
							</span>
						</div>
					</div>
					<div
						class="border-base-content bg-base-200 flex w-full items-start justify-between rounded border px-3 py-1 text-sm"
					>
						<span>{$_(`stats.last_10_distances`)}</span>
						<span
							>{data.allDistances.length ? data.allDistances.slice(-10).join(' → ') : 'keine'}</span
						>
					</div>
					<div
						class="border-base-content bg-base-200 flex w-full items-start justify-between rounded border px-3 py-1 text-sm"
					>
						<span>{$_(`stats.last_drop_distance`)}</span>
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
	<a href="/animals" class="btn btn-link">{$_(`stats.back_to_capture`)}</a>
</div>
