<script lang="ts">
	import { onMount } from 'svelte';
	import type { ResourceEntry, ResourceType } from '$lib/storage/types';
	import { resources } from '$lib/resources';
	import { calculateStats, type StatResult } from '$lib/utils/statistics';
	import { buildDistanceHistogramData } from '$lib/utils/chartData';
	import { resourceStore } from '$lib/stores/resourceStore';
	import { _ } from 'svelte-i18n';
	import StatsDisplay from '$lib/components/StatsDisplay.svelte';

	export let data; // comes from load()
	const resourceType: ResourceType = data.resourceType as ResourceType;
	const type: 'animal' | 'bug' | 'fish' | undefined = data.type;

	let stats:
		| (StatResult & { barData: ReturnType<typeof buildDistanceHistogramData> })
		| Record<string, StatResult & { barData: ReturnType<typeof buildDistanceHistogramData> }>;
	onMount(() => {
		resourceStore.ensureLoaded(resourceType);
	});

	$: entries = $resourceStore[resourceType] || ([] as ResourceEntry[]);

	$: {
		const myStats = calculateStats(entries);
		// console.log(entries);
		// console.log(myStats);
		if ('count' in myStats) {
			// If it's a single StatResult (no sizes)
			const singleStats = myStats as StatResult;
			stats = {
				...singleStats,
				barData: buildDistanceHistogramData(singleStats.allDistances)
			};
		} else {
			// If it's a Record<string, StatResult> (with sizes)
			const sizedStats = myStats as Record<string, StatResult>;
			stats = Object.fromEntries(
				Object.entries(sizedStats).map(([typ, data]) => [
					typ,
					{ ...data, barData: buildDistanceHistogramData(data.allDistances) }
				])
			);
		}
	}

	function getResourceName(resType: ResourceType, typ?: string): string {
		const res = resources.find((r) => r.type === resType);
		if (!res) return typ || 'Typ nicht gefunden';

		if (typ) {
			return $_(`resources.${res.type}.name`) + ' ' + $_(`resources.${res.type}.labels.${typ}`);
		} else {
			return $_(`resources.${res.type}.name`);
		}

		// return res.type;
	}
</script>

{#if type === 'animal'}
	<h1 class="mb-6 text-center text-3xl font-bold">
		🐾 {$_(`resources.${resourceType}.name`)} Stats
	</h1>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		{#each Object.entries(stats) as [typ, statData] (typ)}
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

	{#if stats.count !== undefined}
		<div class="grid grid-cols-1 gap-6">
			<StatsDisplay
				stats={stats as StatResult & { barData: ReturnType<typeof buildDistanceHistogramData> }}
				resourceName={getResourceName(resourceType)}
			/>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			{#each Object.entries(stats) as [typ, statData] (typ)}
				<StatsDisplay stats={statData} resourceName={getResourceName(resourceType, typ)} />
			{/each}
		</div>
	{/if}

	<div class="mt-8 text-center">
		<a href="/bugs" class="btn btn-link">{$_(`stats.back_to_capture`)}</a>
	</div>
{:else if type === 'fish'}
	<h1 class="mb-6 text-center text-3xl font-bold">
		🎣 {$_(`resources.${resourceType}.name`)} Stats
	</h1>

	{#if entries.length == 0}
		<div>Fang an zu tracken um dir hier die Statistiken anzeigen zu lassen!</div>
	{:else}
		<StatsDisplay
			stats={stats as StatResult & { barData: ReturnType<typeof buildDistanceHistogramData> }}
			resourceName={getResourceName(resourceType)}
		/>
	{/if}
	<!-- huhugcc -->
	<!-- {JSON.stringify(stats)} -->
	<div class="mt-8 text-center">
		<a href="/fish" class="btn btn-link">{$_(`stats.back_to_capture`)}</a>
	</div>
{:else}
	<p>Resource type not found or not supported for stats.</p>
{/if}
