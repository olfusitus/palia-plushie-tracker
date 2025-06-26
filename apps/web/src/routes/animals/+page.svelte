<script lang="ts">
	import { resources } from '$lib/resources';
	import { type AnimalResource } from '$lib/storage';
	import ResourceTracker from '$lib/components/ResourceTracker.svelte';
	import AnimalButtons from '$lib/components/trackers/AnimalButtons.svelte';
	import { _ } from 'svelte-i18n';

	const animalResources: AnimalResource[] = resources.filter(
		(resource): resource is AnimalResource => resource.type.startsWith('animal_')
	);
</script>

<h1 class="mb-6 text-center text-3xl font-bold">🐾 {$_(`animals.title`)}</h1>

<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
	{#each animalResources as animal (animal.type)}
		<ResourceTracker title={$_(`resources.${animal.type}.name`)} resourceType={animal.type}>
			<AnimalButtons resource={animal} />
		</ResourceTracker>
	{/each}
</div>
