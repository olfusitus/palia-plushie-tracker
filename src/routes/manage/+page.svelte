<script lang="ts">
	import { onMount } from 'svelte';
	import type { Entry } from '$lib/storage';
	import { loadData, saveData } from '$lib/storage';

	let daten: Entry[] = [];

	onMount(() => {
		daten = loadData();
	});

	function deleteEntry(index: number) {
		if (confirm('Diesen Eintrag wirklich löschen?')) {
			daten.splice(index, 1);
            daten = [...daten];
            // daten = [...daten.slice(0, index), ...daten.slice(index + 1)];
			saveData(daten);
		}
	}
</script>

<h1 class="text-2xl font-bold mb-4 text-center">Einträge verwalten</h1>

{#if daten.length === 0}
	<p class="text-center text-gray-500">Keine Einträge vorhanden.</p>
{:else}
	<ul class="max-w-xl mx-auto space-y-3">
		{#each daten as eintrag, i}
			<li class="flex justify-between items-center bg-white p-3 rounded shadow">
				<div>
					<p class="text-sm">{new Date(eintrag.timestamp).toLocaleString()}</p>
					<p class="font-medium">{eintrag.type.toUpperCase()} – {eintrag.gold} Gold</p>
				</div>
				<button
					on:click={() => deleteEntry(i)}
					class="text-red-600 hover:underline text-sm"
				>
					Löschen
				</button>
			</li>
		{/each}
	</ul>
{/if}

<div class="mt-8 text-center">
	<a href="/" class="text-blue-700 underline">Zurück zur Erfassung</a>
</div>
