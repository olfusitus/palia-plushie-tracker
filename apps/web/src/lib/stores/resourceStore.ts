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
	const loadAndCache = (resourceType: ResourceType): ResourceEntry[] => {
		const entries = storageService.repository.getEntries(resourceType, getActiveProfile());
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
		ensureLoaded: (resourceType: ResourceType) => {
			const currentState = get({ subscribe });
			if (currentState[resourceType] === undefined) {
				loadAndCache(resourceType);
			}
		},

		addEntry: (resourceType: ResourceType, plushie: boolean, resourceSize?: ResourceSize) => {
			const entry: ResourceEntry = {
				id: crypto.randomUUID(),
				timestamp: new Date().toISOString(),
				rareDrops: plushie ? 1 : 0,
				...(resourceSize !== undefined && { type: resourceSize })
			};
			update((state) => {
				let currentEntries = state[resourceType];
				if (currentEntries === undefined) {
					currentEntries = loadAndCache(resourceType);
				}
				const newEntries = [...currentEntries, entry];
				storageService.repository.saveEntries(resourceType, getActiveProfile(), newEntries);
				return { ...state, [resourceType]: newEntries };
			});
		},

		addMultipleEntries: (
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

			update((state) => {
				let currentEntries = state[resourceType];
				if (currentEntries === undefined) {
					currentEntries = loadAndCache(resourceType);
				}
				const updatedEntries = [...currentEntries, ...newEntries];
				storageService.repository.saveEntries(resourceType, getActiveProfile(), updatedEntries);
				return { ...state, [resourceType]: updatedEntries };
			});
		},
		/**
		 * Deletes a resource entry by its timestamp
		 * @param resourceType - The type of resource
		 * @param timestamp - The timestamp of the entry to delete
		 */
		deleteEntry: (resourceType: ResourceType, id: string) => {
			update((state) => {
				const currentEntries = state[resourceType];
				if (currentEntries === undefined) {
					// We don't need to delete anything if the resource type is not loaded?? Or do we?
					return state;
					// currentEntries = loadAndCache(resourceType);
				}
				const newEntries = currentEntries.filter((e) => e.id !== id);

				storageService.repository.saveEntries(resourceType, getActiveProfile(), newEntries);
				return { ...state, [resourceType]: newEntries };
			});
		}
	};
}

// Export the singleton instance of the resource store
export const resourceStore = createResourceStore();
