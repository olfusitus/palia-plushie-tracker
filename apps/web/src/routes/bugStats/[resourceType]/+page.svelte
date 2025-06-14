<script lang="ts">
	import type { BugEntry, ResourceType } from '$lib/storage/types';
	import { resources } from '$lib/resources';
	import { chartRender } from '$lib/actions/chartRender';
	import { calculateBugStats } from '$lib/utils/statistics';
	import { buildDistanceHistogramData } from '$lib/utils/chartData';
	import { resourceStore } from '$lib/stores/resourceStore';
	import { onMount } from 'svelte';

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
			return res.name;
		}
		return res.name;
		// // typ entspricht "small", "medium", "large" → labels[typ] oder fallback
		// return res.name + ' ' + ((res as any)?.labels?.[typ] ?? typ);
	}
</script>

<h1 class="mb-6 text-center text-3xl font-bold">Bug Catching Stats</h1>

<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
	<div class="card bg-base-100 border-base-200 border shadow-xl">
		<div class="card-body items-center p-4 text-center">
			<h2 class="card-title mb-2 capitalize">{getResourceName(resourceType)}</h2>
			<div class="mb-2 flex flex-wrap justify-center gap-2">
				<span class="badge badge-primary">Einträge: {stats.count}</span>
				<span class="badge badge-secondary">Plüschis: {stats.totalRareDrops}</span>
				<span class="badge badge-accent">Anteil: {stats.share}</span>
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
					<span>{stats.avgDistance}</span>
				</div>
				<div
					class="border-base-content bg-base-200 flex w-full items-start justify-between rounded border px-3 py-1 text-sm"
				>
					<span>Geringster Abstand</span>
					<span>{stats.lowestDistance}</span>
				</div>
				<div
					class="border-base-content bg-base-200 flex w-full items-start justify-between rounded border px-3 py-1 text-sm"
				>
					<span>Höchster Abstand</span>
					<span>{stats.highestDistance}</span>
				</div>
				<div
					class="border-base-content bg-base-200 flex w-full items-start justify-between rounded border px-3 py-1 text-sm"
				>
					<span>Letzte 10 Abstände</span>
					<span
						>{stats.allDistances.length ? stats.allDistances.slice(-10).join(' → ') : 'keine'}</span
					>
				</div>
				<div
					class="border-base-content bg-base-200 flex w-full items-start justify-between rounded border px-3 py-1 text-sm"
				>
					<span>Letzter Drop vor:</span>
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
	<a href="/bugs2" class="btn btn-link">Zurück zur Erfassung</a>
</div>
