<script lang="ts">
    import { resources } from '$lib/resources';
    // import ResourceTracker from '$lib/components/ResourceTracker.svelte';
    import { addEntry, type ResourceType, type ResourceSize } from '$lib/storage';
	import AnimalTracker from '$lib/components/AnimalTracker.svelte';

    // Filtere nur die Ressourcen vom Typ "animal"
    const resourcesList = resources.filter((resource) => resource.type === 'animal_chapaa' || resource.type === 'animal_muujin' || resource.type === 'animal_sernuk');

    function handleAddEntry(resourceType: string, size: string, rareDrops: number) {
        console.log('handleAddEntry', resourceType, size, rareDrops);
        addEntry(resourceType as ResourceType, size as ResourceSize, rareDrops);
    }
</script>

<h1 class="text-2xl font-bold mb-4">Tierchen</h1>

<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {#each resourcesList as animal}
        <div class="border rounded-lg p-4 shadow-md">
            <!-- <h2 class="text-xl font-semibold mt-6">{animal.name}</h2> -->
            <AnimalTracker resource={animal} addEntry={handleAddEntry} />
        </div>
    {/each}
</div>