/**
 * Resource Store for Palia
 *
 * This store manages the state of all resource entries (animals, bugs, etc.) in the game.
 * It provides methods to add, delete, and manage resource entries while persisting data to localStorage.
 */

import {
	// type AnimalEntry,
	// type BugEntry,
	type ResourceEntry,
	type ResourceSize,
	type ResourceType
} from '$lib/storage/types';
import { storageService } from '$lib/storage/index';
import { get, writable } from 'svelte/store';
import { getActiveProfile } from '$lib/profile';

// Dictionary mapping ResourceType to an array of ResourceEntry objects
// Each resource type (e.g., animal_chapaa, animal_sernuk) has its own array of entries
type ResourceStoreState = Record<ResourceType, ResourceEntry[] | undefined>;

/**
 * Creates a Svelte store for managing resource entries
 * @returns A store object with methods to manage resource entries
 */
function createResourceStore() {
	const { subscribe, set, update } = writable<ResourceStoreState>({} as ResourceStoreState);
	const loadAndCache = async (resourceType: ResourceType): Promise<ResourceEntry[]> => {
		const entries = await storageService.repository.getEntries(resourceType, await getActiveProfile());
		update((state) => ({
			...state,
			[resourceType]: entries
		}));
		return entries;
	};

	return {
		subscribe,
		reset: () => {
			set({} as ResourceStoreState);
		},
		/**
		 * Ensures that entries for a specific resource type are loaded into the store
		 * @param resourceType - The type of resource to load
		 */
		ensureLoaded: async (resourceType: ResourceType) => {
			const currentState = get({ subscribe });
			if (currentState[resourceType] === undefined) {
				await loadAndCache(resourceType);
			}
		},

		addEntry: async (resourceType: ResourceType, plushie: boolean, resourceSize?: ResourceSize) => {
			const entry: ResourceEntry = {
				id: crypto.randomUUID(),
				timestamp: new Date().toISOString(),
				rareDrops: plushie ? 1 : 0,
				...(resourceSize !== undefined && { type: resourceSize })
			};
			const currentEntries = get({ subscribe })[resourceType] ?? await loadAndCache(resourceType);
			const newEntries = [...currentEntries, entry];
			await storageService.repository.saveEntries(resourceType, await getActiveProfile(), newEntries);
			update((state) => ({ ...state, [resourceType]: newEntries }));
		},

		addMultipleEntries: async (
			resourceType: ResourceType,
			plushie: boolean,
			count: number,
			resourceSize?: ResourceSize
		) => {
			const newEntries = Array(count)
				.fill(null)
				.map(() => ({
					id: crypto.randomUUID(),
					timestamp: new Date().toISOString(),
					rareDrops: plushie ? 1 : 0,
					...(resourceSize !== undefined && { type: resourceSize })
				}));

			const currentEntries = get({ subscribe })[resourceType] ?? await loadAndCache(resourceType);
			const updatedEntries = [...currentEntries, ...newEntries];
			await storageService.repository.saveEntries(resourceType, await getActiveProfile(), updatedEntries);
			update((state) => ({ ...state, [resourceType]: updatedEntries }));
		},
		/**
		 * Deletes a resource entry by its timestamp
		 * @param resourceType - The type of resource
		 * @param timestamp - The timestamp of the entry to delete
		 */
		deleteEntry: async (resourceType: ResourceType, id: string) => {
			const currentEntries = get({ subscribe })[resourceType];
			if (currentEntries === undefined) {
				// We don't need to delete anything if the resource type is not loaded?? Or do we?
				return;
			}
			const newEntries = currentEntries.filter((e) => e.id !== id);
			await storageService.repository.saveEntries(resourceType, await getActiveProfile(), newEntries);
			update((state) => ({ ...state, [resourceType]: newEntries }));
		}
	};
}

// Export the singleton instance of the resource store
export const resourceStore = createResourceStore();
