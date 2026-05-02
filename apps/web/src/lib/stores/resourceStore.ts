/**
 * Resource Store for Palia
 *
 * This store manages the state of all resource entries (animals, bugs, etc.) in the game.
 * It provides methods to add, delete, and manage resource entries while persisting data to localStorage.
 */

import {
	// type AnimalEntry,
	// type BugEntry,
	type ResourceEntryInput,
	type ResourceEntry,
	// type ResourceSize,
	type ResourceType
} from '$lib/storage/types';
import { storageService } from '$lib/storage/index';
import { get, writable } from 'svelte/store';
import { getActiveProfileId } from '$lib/profile';

// Dictionary mapping ResourceType to an array of ResourceEntry objects
// Each resource type (e.g., animal_chapaa, animal_sernuk) has its own array of entries
type ResourceStoreState = Record<ResourceType, ResourceEntry[] | undefined>;

function createEntry(
	entryOrPlushie: boolean | ResourceEntryInput,
	legacyType?: string
): ResourceEntry {
	const legacyEntry =
		typeof entryOrPlushie === 'boolean'
			? {
				rareDrops: entryOrPlushie ? 1 : 0,
				...(legacyType !== undefined && { type: legacyType })
			}
			: {
				rareDrops: entryOrPlushie.rareDrops ?? 0,
				...(entryOrPlushie.type !== undefined && { type: entryOrPlushie.type }),
				...(entryOrPlushie.variant !== undefined && { variant: entryOrPlushie.variant }),
				...(entryOrPlushie.rareDropType !== undefined && {
					rareDropType: entryOrPlushie.rareDropType
				})
			};

	return {
		id: crypto.randomUUID(),
		timestamp: new Date().toISOString(),
		...legacyEntry
	};
}

/**
 * Creates a Svelte store for managing resource entries
 * @returns A store object with methods to manage resource entries
 */
function createResourceStore() {
	const { subscribe, set, update } = writable<ResourceStoreState>({} as ResourceStoreState);
	const loadAndCache = async (resourceType: ResourceType): Promise<ResourceEntry[]> => {
		const activeProfileId = await getActiveProfileId();
		if (!activeProfileId) {
			console.warn('No active profile ID found, using default profile');
			return [];
		}
		const entries = await storageService.repository.getEntries(resourceType, activeProfileId);
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

		addEntry: async (
			resourceType: ResourceType,
			entryOrPlushie: boolean | ResourceEntryInput,
			resourceSize?: string
		) => {
			const activeProfileId = await getActiveProfileId();
			if (!activeProfileId) {
				console.error('No active profile ID found, cannot add entry');
				return;
			}

			const entry = createEntry(entryOrPlushie, resourceSize);

			// Direkter Aufruf der atomaren Methode
			await storageService.repository.addEntry(resourceType, activeProfileId, entry);

			// Update In-Memory-Cache
			const currentEntries = get({ subscribe })[resourceType] ?? (await loadAndCache(resourceType));
			const newEntries = [...currentEntries, entry];
			update((state) => ({ ...state, [resourceType]: newEntries }));
		},

		addMultipleEntries: async (
			resourceType: ResourceType,
			entryOrPlushie: boolean | ResourceEntryInput,
			count: number,
			resourceSize?: string
		) => {
			const activeProfileId = await getActiveProfileId();
			if (!activeProfileId) {
				console.error('No active profile ID found, cannot add entries');
				return;
			}

			const newEntries = Array(count)
				.fill(null)
				.map(() => createEntry(entryOrPlushie, resourceSize));

			// Add entries one by one using atomic operations
			for (const entry of newEntries) {
				await storageService.repository.addEntry(resourceType, activeProfileId, entry);
			}

			// Update In-Memory-Cache
			const currentEntries = get({ subscribe })[resourceType] ?? (await loadAndCache(resourceType));
			const updatedEntries = [...currentEntries, ...newEntries];
			update((state) => ({ ...state, [resourceType]: updatedEntries }));
		},
		/**
		 * Deletes a resource entry by its ID
		 * @param resourceType - The type of resource
		 * @param id - The ID of the entry to delete
		 */
		deleteEntry: async (resourceType: ResourceType, id: string) => {
			// Direkter Aufruf der atomaren Methode
			await storageService.repository.deleteEntry(id);

			// Update In-Memory-Cache
			const currentEntries = get({ subscribe })[resourceType];
			if (currentEntries === undefined) {
				// We don't need to delete anything if the resource type is not loaded
				return;
			}
			const newEntries = currentEntries.filter((e) => e.id !== id);
			update((state) => ({ ...state, [resourceType]: newEntries }));
		}
	};
}

// Export the singleton instance of the resource store
export const resourceStore = createResourceStore();
