<script lang="ts">
	import type { BugEntry, ResourceType } from '$lib/storage/types';
	import { resources } from '$lib/resources';
	import { chartRender } from '$lib/actions/chartRender';
	import { calculateBugStats } from '$lib/utils/statistics';
	import { buildDistanceHistogramData } from '$lib/utils/chartData';
	import { resourceStore } from '$lib/stores/resourceStore';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let stats: any = {};

	export let data; // kommt von load()
	const resourceType: ResourceType = data.resourceType as ResourceType;

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
		// // typ entspricht "small", "medium", "large" → labels[typ] oder fallback
		// return res.name + ' ' + ((res as any)?.labels?.[typ] ?? typ);
	}
</script>

<h1 class="mb-6 text-center text-3xl font-bold">🐞 {$_(`stats.title_bug`)}</h1>

<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
	<div class="card bg-base-100 border-base-200 border shadow-xl">
		<div class="card-body items-center p-4 text-center">
			<h2 class="card-title mb-2 capitalize">{getResourceName(resourceType)}</h2>
			<div class="mb-2 flex flex-wrap justify-center gap-2">
				<span class="badge badge-primary">{$_(`stats.entries`)}: {stats.count}</span>
				<span class="badge badge-secondary">{$_(`stats.plushies`)}: {stats.totalRareDrops}</span>
				<span class="badge badge-accent">{$_(`stats.share`)}: {stats.share}</span>
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
					<span>{stats.avgDistance}</span>
				</div>
				<div class="flex w-full gap-1">
					<div
						class="border-base-content bg-base-200 flex flex-1 items-start justify-between rounded border px-3 py-1 text-sm"
					>
						<span>{$_(`stats.lowest_distance`)}</span>
						<span>{stats.lowestDistance}</span>
					</div>
					<div
						class="border-base-content bg-base-200 flex flex-1 items-start justify-between rounded border px-3 py-1 text-sm"
					>
						<span>{$_(`stats.highest_distance`)}</span>
						<span
							>{stats.highestDistance > stats.timeSinceLast
								? stats.highestDistance
								: stats.timeSinceLast}</span
						>
					</div>
				</div>
				<div
					class="border-base-content bg-base-200 flex w-full items-start justify-between rounded border px-3 py-1 text-sm"
				>
					<span>{$_(`stats.last_10_distances`)}</span>
					<span
						>{stats.allDistances.length ? stats.allDistances.slice(-10).join(' → ') : $_(`stats.no_distances`)}</span
					>
				</div>
				<div
					class="border-base-content bg-base-200 flex w-full items-start justify-between rounded border px-3 py-1 text-sm"
				>
					<span>{$_(`stats.last_drop_distance`)}</span>
					<span>{stats.timeSinceLast}</span>
				</div>
				<div
					class="border-base-content bg-base-200 flex w-full items-start justify-between rounded border px-3 py-1 text-sm"
				>
					<canvas use:chartRender={stats.barData}></canvas>
				</div>
			</div>
		</div>
	</div>
</div>

<div class="mt-8 text-center">
	<a href="/bugs2" class="btn btn-link">{$_(`stats.back_to_capture`)}</a>
</div>
