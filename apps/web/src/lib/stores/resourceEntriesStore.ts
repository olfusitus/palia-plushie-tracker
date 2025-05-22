import { loadResourceEntries, type ResourceType } from '$lib/storage';
import { writable, derived, type Readable } from 'svelte/store';

const refreshTrigger = writable(0);
export function createResourceEntriesStore(resourceTypeStore: Readable<ResourceType | undefined>) {
	return derived(
		[resourceTypeStore, refreshTrigger],
		([$resourceType]) => {
			if (!$resourceType) return []; // oder null, oder [] je nach Anwendungsfall
			return loadResourceEntries($resourceType);
		}
	);
}

// Diese Funktion kannst du überall importieren:
export function triggerResourceEntriesRefresh() {
	refreshTrigger.update(n => n + 1);
}
