<script lang="ts">
	import { onMount } from 'svelte';
	import type { AnimalEntry, ResourceType } from '$lib/storage/types';
	import { resources } from '$lib/resources';
	import { calculateAnimalStats, type StatResult } from '$lib/utils/statistics';
	import { buildDistanceHistogramData } from '$lib/utils/chartData';
	import { resourceStore } from '$lib/stores/resourceStore';
	import { _ } from 'svelte-i18n';
	import StatsDisplay from '$lib/components/StatsDisplay.svelte';

	let stats: Record<
		string,
		StatResult & { barData: ReturnType<typeof buildDistanceHistogramData> }
	> = {};

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

	function getResourceName(resourceType: ResourceType, typ: string): string {
		const res = resources.find((r) => r.type === resourceType);
		if (!res) return typ;
		// typ entspricht "small", "medium", "large" → labels[typ] oder fallback
		return $_(`resources.${res.type}.name`) + ' ' + $_(`resources.${res.type}.labels.${typ}`);
	}
</script>

<h1 class="mb-6 text-center text-3xl font-bold">🐾 {$_(`stats.title_animal`)}</h1>

<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
	{#each Object.entries(stats) as [typ, statData] (typ)}
		<StatsDisplay
			stats={statData}
			resourceName= {getResourceName(resourceType, typ)}
		/>
	{/each}
</div>

<div class="mt-8 text-center">
	<a href="/animals" class="btn btn-link">{$_(`stats.back_to_capture`)}</a>
</div>
