<script lang="ts">
	import { onMount } from 'svelte';
	import type { AnimalEntry, BugEntry, FishEntry, ResourceType } from '$lib/storage/types';
	import { resources } from '$lib/resources';
	import { calculateAnimalStats, calculateBugStats, calculateFishStats, type StatResult } from '$lib/utils/statistics';
	import { buildDistanceHistogramData } from '$lib/utils/chartData';
	import { resourceStore } from '$lib/stores/resourceStore';
	import { _ } from 'svelte-i18n';
	import StatsDisplay from '$lib/components/StatsDisplay.svelte';

	export let data; // comes from load()
	const resourceType: ResourceType = data.resourceType as ResourceType;
	const type: 'animal' | 'bug' | 'fish' |undefined = data.type;

	let stats: StatResult & { barData: ReturnType<typeof buildDistanceHistogramData> };
	let animalStats: Record<
		string,
		StatResult & { barData: ReturnType<typeof buildDistanceHistogramData> }
	> = {};

	// ensure Data is loaded into the store
	onMount(() => {
		resourceStore.ensureLoaded(resourceType);
	});

	$: entries = $resourceStore[resourceType] || ([] as (AnimalEntry | BugEntry)[]);

	$: {
		if (type === 'animal') {
			animalStats = Object.fromEntries(
				Object.entries(calculateAnimalStats(entries as AnimalEntry[])).map(([typ, data]) => [
					typ,
					{ ...data, barData: buildDistanceHistogramData(data.allDistances) }
				])
			);
		} else if (type === 'bug') {
			const bugStats = calculateBugStats(entries as BugEntry[]);
			stats = {
				...bugStats,
				barData: buildDistanceHistogramData(bugStats.allDistances)
			};
		} else if (type === 'fish') {
			const fishStats = calculateFishStats(entries as FishEntry[]);
			stats = {
				...fishStats,
				barData: buildDistanceHistogramData(fishStats.allDistances)
			};
		}
	}

	function getResourceName(resType: ResourceType, typ?: string): string {
		const res = resources.find((r) => r.type === resType);
		if (!res) return typ || 'Typ nicht gefunden';

		if (type === 'animal' && typ) {
			return $_(`resources.${res.type}.name`) + ' ' + $_(`resources.${res.type}.labels.${typ}`);
		} else if (type === 'bug' || type === 'fish') {
			return $_(`resources.${res.type}.name`);
		}
		return res.type;
	}
</script>

{#if type === 'animal'}
	<h1 class="mb-6 text-center text-3xl font-bold">
		🐾 {$_(`resources.${resourceType}.name`)} Stats
	</h1>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		{#each Object.entries(animalStats) as [typ, statData] (typ)}
			<StatsDisplay stats={statData} resourceName={getResourceName(resourceType, typ)} />
		{/each}
	</div>

	<div class="mt-8 text-center">
		<a href="/animals" class="btn btn-link">{$_(`stats.back_to_capture`)}</a>
	</div>
{:else if type === 'bug'}
	<h1 class="mb-6 text-center text-3xl font-bold">
		🐞 {$_(`resources.${resourceType}.name`)} Stats
	</h1>

	<StatsDisplay {stats} resourceName={getResourceName(resourceType)} />

	<div class="mt-8 text-center">
		<a href="/bugs2" class="btn btn-link">{$_(`stats.back_to_capture`)}</a>
	</div>
{:else if type === 'fish'}
	<h1 class="mb-6 text-center text-3xl font-bold">
		🎣 {$_(`resources.${resourceType}.name`)} Stats
	</h1>

	<StatsDisplay {stats} resourceName={getResourceName(resourceType)} />

	<div class="mt-8 text-center">
		<a href="/fish" class="btn btn-link">{$_(`stats.back_to_capture`)}</a>
	</div>
{:else}
	<p>Resource type not found or not supported for stats.</p>
{/if}
