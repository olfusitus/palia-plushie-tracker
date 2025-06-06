<script lang="ts">
	import { resources } from '$lib/resources';
	import { type AnimalResource } from '$lib/storage';
	import AnimalTracker from '$lib/components/AnimalTracker.svelte';

	const resourcesList: AnimalResource[] = resources.filter((resource): resource is AnimalResource =>
		resource.type.startsWith('animal_')
	);
</script>

<h1 class="mb-6 text-center text-3xl font-bold">🐾 Tierchen</h1>

<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
	{#each resourcesList as animal (animal.type)}
		<!-- <div class="card bg-base-100 shadow-xl border border-base-200">
			<div class="card-body p-4"> -->
		<AnimalTracker resource={animal} />
		<!-- </div> -->
		<!-- </div> -->
	{/each}
</div>
