<!-- <script lang="ts">
    import { resources } from '$lib/resources';
    import ResourceTracker from '$lib/components/ResourceTracker.svelte';
    import { addOreEntry, type ResourceType, type ResourceSize } from '$lib/storage';

    // Filtere nur die Ressourcen vom Typ "ore"
    const ores = resources.filter((resource) => resource.type === 'ore_gold' || resource.type === 'ore_silver');

    function handleAddEntry(resourceType: string, size: string, rareDrops: number) {
        console.log('handleAddEntry', resourceType, size, rareDrops);
        addOreEntry(resourceType as ResourceType, size as ResourceSize, rareDrops);
    }
</script>

<h1 class="text-2xl font-bold mb-4">Erze</h1>

{#each ores as ore}
    <h2 class="text-xl font-semibold mt-6">{ore.name}</h2>
    <ResourceTracker resource={ore} addEntry={handleAddEntry} />
{/each} -->
