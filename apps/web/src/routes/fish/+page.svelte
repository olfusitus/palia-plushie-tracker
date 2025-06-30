<script lang="ts">
	import { resources } from '$lib/resources';
	import { type FishResource } from '$lib/storage';
	import ResourceTracker from '$lib/components/ResourceTracker.svelte';
	import FishButtons from '$lib/components/trackers/FishButtons.svelte';
	import { _ } from 'svelte-i18n';

	const fishResources: FishResource[] = resources.filter((resource): resource is FishResource =>
		resource.type.startsWith('fish_')
	);
</script>

<h1 class="mb-6 text-center text-3xl font-bold">🎣 {$_(`fish.title`)}</h1>

<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
	{#each fishResources as fishRes (fishRes.type)}
		<ResourceTracker title={$_(`resources.${fishRes.type}.name`)} resourceType={fishRes.type}>
			<FishButtons resource={fishRes} />
		</ResourceTracker>
	{/each}
</div>
