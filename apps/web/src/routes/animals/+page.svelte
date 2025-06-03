<script lang="ts">
	import { resources } from '$lib/resources';
	import { addEntry, type ResourceType, type ResourceSize, type AnimalResource } from '$lib/storage';
	import AnimalTracker from '$lib/components/AnimalTracker.svelte';

	const resourcesList: AnimalResource[] = resources.filter(
		(resource): resource is AnimalResource =>
			resource.type === 'animal_chapaa' ||
			resource.type === 'animal_muujin' ||
			resource.type === 'animal_sernuk' ||
			resource.type === 'animal_ogopuu' ||
			resource.type === 'animal_shmole'
	);

	function handleAddEntry(resourceType: string, size: string, rareDrops: number) {
		addEntry(resourceType as ResourceType, size as ResourceSize, rareDrops);
	}
</script>

<h1 class="mb-6 text-center text-3xl font-bold">🐾 Tierchen</h1>

<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
	{#each resourcesList as animal}
		<!-- <div class="card bg-base-100 shadow-xl border border-base-200">
			<div class="card-body p-4"> -->
		<AnimalTracker resource={animal} addEntry={handleAddEntry} />
		<!-- </div> -->
		<!-- </div> -->
	{/each}
</div>
