<script lang="ts">
	import { resources } from '$lib/resources';
	import { addEntry, type ResourceType, type ResourceSize } from '$lib/storage';
	import BugsTracker from '$lib/components/BugsTracker.svelte';

	// Filtere nur die Ressourcen vom Typ "bug"
	const resourcesList = resources.filter(
		(resource) =>
			resource.type === 'bug_rtb' ||
			resource.type === 'bug_ladybug' ||
			resource.type === 'bug_snail' ||
			resource.type === 'bug_lunar_fairy_moth' ||
			resource.type === 'bug_proudhorn_beetle' ||
			resource.type === 'bug_lanternbug'
	);

	function handleAddEntry(resourceType: string, rareDrops: number) {
		addEntry(resourceType as ResourceType, 'small', rareDrops);
	}
</script>

<h1 class="mb-6 text-center text-3xl font-bold">🐞 Käferchen</h1>

<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
	<!-- {#each resourcesList as animal} -->
		<!-- <div class="card bg-base-100 shadow-xl border border-base-200">
			<div class="card-body p-4"> -->
		<BugsTracker resources={resourcesList} addEntry={handleAddEntry} />
		<!-- <BugTracker resource={animal} addEntry={handleAddEntry} /> -->
		<!-- </div> -->
		<!-- </div> -->
	<!-- {/each} -->
</div>
