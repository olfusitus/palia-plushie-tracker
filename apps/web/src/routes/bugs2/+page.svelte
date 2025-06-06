<script lang="ts">
	import { resources } from '$lib/resources';
	import { type BugResource } from '$lib/storage';
	import BugsTracker from '$lib/components/BugsTracker.svelte';

	// Filtere nur die Ressourcen vom Typ "bug"
	const resourcesList = resources.filter((resource): resource is BugResource =>
		resource.type.startsWith('bug_')
	);
</script>

<h1 class="mb-6 text-center text-3xl font-bold">🐞 Käferchen</h1>

<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
	<!-- {#each resourcesList as animal} -->
	<!-- <div class="card bg-base-100 shadow-xl border border-base-200">
			<div class="card-body p-4"> -->
	<BugsTracker resources={resourcesList} />
	<!-- <BugTracker resource={animal} addEntry={handleAddEntry} /> -->
	<!-- </div> -->
	<!-- </div> -->
	<!-- {/each} -->
</div>
