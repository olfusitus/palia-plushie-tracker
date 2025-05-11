<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { loadData, saveData } from '$lib/storage';
    import type { ResourceType, ResourceEntry } from '$lib/storage';

    let resourceType: ResourceType;
    let daten: ResourceEntry[] = [];

    $: resourceType = page.params.resourceType as ResourceType;

    onMount(() => {
        if (resourceType) {
            console.log('resourceType', resourceType);
            daten = loadData(resourceType);
        }
    });

    function deleteEntry(index: number) {
        if (confirm('Diesen Eintrag wirklich löschen?')) {
            daten.splice(index, 1);
            daten = [...daten];
            saveData(resourceType, daten);
        }
    }
</script>

<h1 class="mb-4 text-center text-2xl font-bold">Einträge verwalten – {resourceType}</h1>

{#if daten.length === 0}
    <p class="text-center text-gray-500">Keine Einträge vorhanden.</p>
{:else}
    <ul class="mx-auto max-w-xl space-y-3">
        {#each daten.slice().reverse() as eintrag, i}
            <li class="flex items-center justify-between rounded bg-white p-3 shadow">
                <div>
                    <p class="text-sm">{new Date(eintrag.timestamp).toLocaleString()}</p>
                    <p class="font-medium">{eintrag.type.toUpperCase()} – {eintrag.rareDrops} Rare Drops</p>
                </div>
                <button on:click={() => deleteEntry(daten.length - 1 - i)} class="text-sm text-red-600 hover:underline">
                    Löschen
                </button>
            </li>
        {/each}
    </ul>
{/if}

<div class="mt-8 text-center">
    <a href="/" class="text-blue-700 underline">Zurück zur Erfassung</a>
</div>