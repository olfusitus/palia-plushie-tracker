<script lang="ts">
	import { resources } from '$lib/resources';
	import { type BugResource } from '$lib/storage';
	import ResourceTracker from '$lib/components/ResourceTracker.svelte';
	import BugButtons from '$lib/components/trackers/BugButtons.svelte';
	import RockhopperButtons from '$lib/components/trackers/RockhopperButtons.svelte';
	import { _ } from 'svelte-i18n';
	const bugResource: BugResource[] = resources.filter((resource): resource is BugResource =>
		resource.type.startsWith('bug_')
	);
</script>

<h1 class="mb-6 text-center text-3xl font-bold">🐾 {$_(`bugs.title`)}</h1>

<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
	{#each bugResource as bug (bug.type)}
		<ResourceTracker title={$_(`resources.${bug.type}.name`)} resourceType={bug.type}>
			{#if bug.availableSizes}
				<RockhopperButtons resource={bug} />
			{:else}
				<BugButtons resource={bug} />
			{/if}
		</ResourceTracker>
	{/each}
</div>
