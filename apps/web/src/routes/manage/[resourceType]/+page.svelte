<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	// import { loadResourceEntries, saveData } from '$lib/storage';
	import { resourceStore } from '$lib/stores/resourceStore';
	import { type ResourceType, type ResourceEntry } from '$lib/storage/types';
	import { _ } from 'svelte-i18n';
	// import { afterNavigate } from '$app/navigation';
	let resourceType: ResourceType;
	// let daten: ResourceEntry[] = [];

	resourceType = page.params.resourceType as ResourceType;

	onMount(() => {
		resourceStore.ensureLoaded(resourceType);
	});

	$: daten = ($resourceStore[resourceType] || []).sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
	);

	function deleteEntry(entry: ResourceEntry) {
		if (confirm('Diesen Eintrag wirklich löschen?')) {
			resourceStore.deleteEntry(resourceType, entry.id);
		}
	}
</script>

<h1 class="mb-6 text-center text-3xl font-bold">
	{$_(`manageResource.title`)} –
	<span class="badge badge-info badge-lg align-middle">{resourceType}</span>
</h1>

{#if daten.length === 0}
	<div class="text-base-content/60 py-8 text-center">
		<p class="text-lg">{$_(`manageResource.no_entries`)}</p>
	</div>
{:else}
	<ul class="mx-auto max-w-2xl space-y-4">
		{#each daten as eintrag (eintrag.id)}
			<li class="card bg-base-100 border-base-200 border shadow">
				<div class="card-body flex flex-row items-center justify-between p-4">
					<div>
						<p class="text-base-content/60 text-sm">
							{new Date(eintrag.timestamp).toLocaleString()}
						</p>
						<p class="text-base-content font-semibold">
							{#if 'type' in eintrag}
								<span class="badge badge-outline badge-info mr-2">{eintrag.type.toUpperCase()}</span
								>
							{/if}
							<span class="badge badge-outline badge-info"
								>{eintrag.rareDrops} {$_(`manageResource.plushies`)}</span
							>
						</p>
					</div>
					<button on:click={() => deleteEntry(eintrag)} class="btn btn-warning btn-sm btn-outline">
						{$_(`manageResource.delete`)}
					</button>
				</div>
			</li>
		{/each}
	</ul>
{/if}

<div class="mt-8 text-center">
	<a href={resourceType.startsWith('animal_') ? '/animals' : resourceType.startsWith('bug_')? '/bugs2' : '/fish'} class="btn btn-link"
		>{$_(`manageResource.back_to_capture`)}</a
	>
</div>
