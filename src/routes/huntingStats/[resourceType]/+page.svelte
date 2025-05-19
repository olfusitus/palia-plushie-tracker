<script lang="ts">
	import { onMount } from 'svelte';
	import type { ResourceEntry, ResourceType } from '$lib/storage';
	import { loadData } from '$lib/storage';

	let stats: Record<string, any> = {};

	export let data; // kommt von load()
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
				const totalRareDrops = werte.reduce((sum, value) => sum + value, 0);
				const share = totalRareDrops ? ((totalRareDrops / count) * 100).toFixed(2) + '%' : '–';

				const rareDropIndices = werte
					.map((val, idx) => (val !== 0 ? idx : -1))
					.filter(idx => idx !== -1);
				let lastDistance = 0;
				let avgDistance = 0;
				let allDistances: number[] = [];
				if (rareDropIndices.length >= 2) {
					allDistances = rareDropIndices
						.slice(1)
						.map((val, i) => val - rareDropIndices[i]);

					lastDistance = allDistances[allDistances.length - 1];
					avgDistance = allDistances.reduce((a, b) => a + b, 0) / allDistances.length;
				}

				return [
					typ,
					{
						count,
						share,
						totalRareDrops,
						lastDistance,
						avgDistance,
						allDistances
					}
				];
			})
		);
	});
</script>

<h1 class="mb-6 text-center text-3xl font-bold">Hunting Stats</h1>

<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
	{#each Object.entries(stats) as [typ, data]}
		<div class="card bg-base-100 shadow-xl border border-base-200">
			<div class="card-body items-center text-center p-4">
				<h2 class="card-title mb-2 capitalize">{typ}</h2>
				<div class="flex flex-wrap gap-2 justify-center mb-2">
					<span class="badge badge-primary">Einträge: {data.count}</span>
					<span class="badge badge-secondary">Plüschis: {data.totalRareDrops}</span>
					<span class="badge badge-accent">Anteil: {data.share}</span>
				</div>
				<div class="divider my-2">Abstände</div>
				<div class="flex flex-col gap-1 w-full">
					<span class="badge badge-outline w-full flex justify-between">
						<span>Letzter Abstand</span>
						<span>{data.lastDistance}</span>
					</span>
					<span class="badge badge-outline w-full flex justify-between">
						<span>Ø Abstand</span>
						<span>{data.avgDistance}</span>
					</span>
					<span class="badge badge-outline w-full flex justify-between">
						<span>Letzte 10 Abstände</span>
						<span>{data.allDistances.length ? data.allDistances.slice(-10).join(' → ') : 'keine'}</span>
					</span>
				</div>
			</div>
		</div>
	{/each}
</div>

<div class="mt-8 text-center">
	<a href="/" class="btn btn-link">Zurück zur Erfassung</a>
</div>
