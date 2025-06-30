<script lang="ts">
	import type { BugEntry, ResourceType } from '$lib/storage/types';
	import { resources } from '$lib/resources';
	import { calculateBugStats, type StatResult } from '$lib/utils/statistics';
	import { buildDistanceHistogramData } from '$lib/utils/chartData';
	import { resourceStore } from '$lib/stores/resourceStore';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import StatsDisplay from '$lib/components/StatsDisplay.svelte';

	export let data; // kommt von load()
	const resourceType: ResourceType = data.resourceType as ResourceType;

	let stats: StatResult & { barData: ReturnType<typeof buildDistanceHistogramData> };

	onMount(() => {
		resourceStore.ensureLoaded(resourceType);
	});

	$: entries = $resourceStore[resourceType] || ([] as BugEntry[]);

	$: stats = {
		...calculateBugStats(entries),
		barData: buildDistanceHistogramData(calculateBugStats(entries).allDistances)
	};

	function getResourceName(resourceType: string): string {
		const res = resources.find((r) => r.type === resourceType);
		if (!res) return 'Typ nicht gefunden';
		// Für Bugs gibt es keine Typen/Labels
		if (resourceType.startsWith('bug_')) {
			return $_(`resources.${res.type}.name`);
		}
		return $_(`resources.${res.type}.name`);
	}
</script>

<h1 class="mb-6 text-center text-3xl font-bold">🐞 {$_(`stats.title_bug`)}</h1>

<StatsDisplay {stats} resourceName={getResourceName(resourceType)} />

<div class="mt-8 text-center">
	<a href="/bugs2" class="btn btn-link">{$_(`stats.back_to_capture`)}</a>
</div>
