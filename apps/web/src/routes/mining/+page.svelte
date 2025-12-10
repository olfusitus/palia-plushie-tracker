<script lang="ts">
	import { resources } from '$lib/resources';
	import type { MiningResource } from '$lib/storage';
	import ResourceTracker from '$lib/components/ResourceTracker.svelte';
	import MiningButtons from '$lib/components/trackers/MiningButtons.svelte';
	import { _ } from 'svelte-i18n';

	const miningResources: MiningResource[] = resources.filter(
		(resource): resource is MiningResource => resource.type.startsWith('mining_')
	);
</script>

<h1 class="mb-6 text-center text-3xl font-bold">⛏️ {$_(`mining.title`)}</h1>

<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
	{#each miningResources as miningRes (miningRes.type)}
		<ResourceTracker title={$_(`resources.${miningRes.type}.name`)} resourceType={miningRes.type}>
			<MiningButtons resource={miningRes} />
		</ResourceTracker>
	{/each}
</div>
