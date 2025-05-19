<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { loadData, saveData } from '$lib/storage';
	import type { ResourceType, ResourceEntry } from '$lib/storage';

	let resourceType: ResourceType;
	let daten: ResourceEntry[] = [];

	$: resourceType = page.params.resourceType as ResourceType;

	onMount(() => {
		if (resourceType) {
			console.log('resourceType', resourceType);
			daten = loadData(resourceType);
		}
	});

	function deleteEntry(index: number) {
		if (confirm('Diesen Eintrag wirklich löschen?')) {
			daten.splice(index, 1);
			daten = [...daten];
			saveData(resourceType, daten);
		}
	}
</script>

<h1 class="mb-6 text-center text-3xl font-bold">Einträge verwalten – <span class="badge badge-info badge-lg align-middle">{resourceType}</span></h1>

{#if daten.length === 0}
	<div class="text-center text-base-content/60 py-8">
		<p class="text-lg">Keine Einträge vorhanden.</p>
	</div>
{:else}
	<ul class="mx-auto max-w-2xl space-y-4">
		{#each daten.slice().reverse() as eintrag, i}
			<li class="card bg-base-100 shadow border border-base-200">
				<div class="card-body flex flex-row items-center justify-between p-4">
					<div>
						<p class="text-sm text-base-content/60">{new Date(eintrag.timestamp).toLocaleString()}</p>
						<p class="font-semibold text-base-content">
							<span class="badge badge-outline badge-info mr-2">{eintrag.type.toUpperCase()}</span>
							<span class="badge badge-outline badge-info">{eintrag.rareDrops} Rare Drops</span>
						</p>
					</div>
					<button
						on:click={() => deleteEntry(daten.length - 1 - i)}
						class="btn btn-warning btn-sm btn-outline"
					>
						Löschen
					</button>
				</div>
			</li>
		{/each}
	</ul>
{/if}

<div class="mt-8 text-center">
	<a href="/" class="btn btn-link">Zurück zur Erfassung</a>
</div>
