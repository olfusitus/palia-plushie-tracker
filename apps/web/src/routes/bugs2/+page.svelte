<script lang="ts">
	import { resources } from '$lib/resources';
	import { type BugResource } from '$lib/storage';
	import BugsTracker from '$lib/components/BugsTracker.svelte';

	const resourcesList = resources.filter((resource): resource is BugResource =>
		resource.type.startsWith('bug_')
	);
</script>

<h1 class="mb-6 text-center text-3xl font-bold">🐞 Käferchen</h1>

<div class="">
	<BugsTracker resources={resourcesList} />
</div>
