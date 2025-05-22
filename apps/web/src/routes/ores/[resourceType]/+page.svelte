<script lang="ts">
	import { onMount } from 'svelte';
	import { resources } from '$lib/resources';
	import ResourceTracker from '$lib/components/ResourceTracker.svelte';
	import { addEntry, type ResourceType, type ResourceSize, type Resource } from '$lib/storage';
	// import { page } from '$app/state';
	export let data; // kommt von load()
	$: resourceType = data.resourceType;

	let resourceL = [] as Resource[];

	// resourceType = page.params.resourceType as ResourceType;
	$: {
		if (resourceType) {
			resourceL = resources.filter((resource) => resource.type === resourceType);
			console.log('resourceType:', resourceType);
			console.log('resourceL:', resourceL);
		}
	}

	function handleAddEntry(resourceType: string, size: string, rareDrops: number) {
		console.log('handleAddEntry', resourceType, size, rareDrops);
		addEntry(resourceType as ResourceType, size as ResourceSize, rareDrops);
	}
</script>

<!-- <h1 class="mb-6 text-center text-2xl font-bold">Erz-Drop Tracker</h1> -->
<div class="w-full max-w-md space-y-8">
	<!-- <div>{resourceType}</div> -->
	{#each resourceL as res}
		<h1 class="mb-6 text-center text-3xl font-bold tracking-tight text-gray-800">
			{res.name} Tracker
		</h1>

		<!-- <h2 class="text-xl font-semibold mt-6">{ore.name}</h2> -->
		<ResourceTracker resource={res} addEntry={handleAddEntry} />
	{/each}
</div>
