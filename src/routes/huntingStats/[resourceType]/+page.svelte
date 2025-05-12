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
               // const total = Object.values(grouped).flat().length;
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

<h1 class="mb-6 text-center text-2xl font-bold">Statistik</h1>

<div class="grid grid-cols-1 gap-4 text-center md:grid-cols-3">
	{#each Object.entries(stats) as [typ, data]}
        <div class="rounded bg-white p-4 shadow">
            <h2 class="mb-2 text-lg font-semibold">
                {typ.charAt(0).toUpperCase() + typ.slice(1)}
            </h2>
            <p><strong>Einträge:</strong> {data.count}</p>
			<p><strong>Anzahl Plüschis:</strong> {data.totalRareDrops}</p>
            <p><strong>Anteil:</strong> {data.share}</p>
            <p><strong>Letzter Abstand:</strong> {data.lastDistance}</p>
            <!-- <p><strong>Alle Abstände:</strong> {data.allDistances.length > 0 
				? data.allDistances.map((n: number) => n).join(" → ") 
				: "keine"}</p> -->
			<p>
				<strong>Letzte 10 Abstände:</strong> {
					data.allDistances.length
					? data.allDistances
						.slice(-10)
						.map((n: number) => n)
						.join(" → ")
					: "keine"
				}
			</p>
            <p><strong>Ø Abstand:</strong> {data.avgDistance}</p>
        </div>
    {/each}
</div>

<div class="mt-8 text-center">
	<a href="/" class="text-blue-700 underline">Zurück zur Erfassung</a>
</div>
