/**
 * Resource Store for Palia
 *
 * This store manages the state of all resource entries (animals, bugs, etc.) in the game.
 * It provides methods to add, delete, and manage resource entries while persisting data to localStorage.
 */

// import { resources } from "$lib/resources";
import {
	loadResourceEntries,
	saveData,
	type AnimalEntry,
	type BugEntry,
	type ResourceEntry,
	type ResourceSize,
	type ResourceType
} from '$lib/storage';
import { get, writable } from 'svelte/store';

// Dictionary mapping ResourceType to an array of ResourceEntry objects
// Each resource type (e.g., animal_chapaa, animal_sernuk) has its own array of entries
type ResourceStoreState = Record<ResourceType, ResourceEntry[] | undefined>;

/**
 * Creates an empty initial state with all resource types initialized to empty arrays
 */
// function createInitialState(): ResourceStoreState {
//     const initialState: Partial<ResourceStoreState> = {};
//     resources.forEach(resource => {
//         initialState[resource.type as ResourceType] = [];
//     });
//     return initialState as ResourceStoreState;
// }

/**
 * Creates a Svelte store for managing resource entries
 * @returns A store object with methods to manage resource entries
 */
function createResourceStore() {
	const { subscribe, set, update } = writable<ResourceStoreState>({} as ResourceStoreState);
	const loadAndCache = (resourceType: ResourceType): ResourceEntry[] => {
		const entries = loadResourceEntries(resourceType);
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
		/**
		 * Adds a new animal entry to the store
		 * @param resourceType - The type of animal resource
		 * @param size - The size of the animal
		 * @param plushie - Whether the animal dropped a plushie
		 */
		addAnimalEntry: (resourceType: ResourceType, size: ResourceSize, plushie: boolean) => {
			const entry: AnimalEntry = {
				id: crypto.randomUUID(),
				timestamp: new Date().toISOString(),
				type: size,
				rareDrops: plushie ? 1 : 0
			};

			update((state) => {
				let currentEntries = state[resourceType];
				if (currentEntries === undefined) {
					currentEntries = loadAndCache(resourceType);
				}
				const newEntries = [...currentEntries, entry];
				saveData(resourceType, newEntries);
				return { ...state, [resourceType]: newEntries };
			});
		},
		/**
		 * Adds a new bug entry to the store
		 * @param resourceType - The type of bug resource
		 * @param plushie - Whether the bug dropped a plushie
		 */
		addBugEntry: (resourceType: ResourceType, plushie: boolean) => {
			const entry: BugEntry = {
				id: crypto.randomUUID(),
				timestamp: new Date().toISOString(),
				rareDrops: plushie ? 1 : 0
			};
			update((state) => {
				let currentEntries = state[resourceType];
				if (currentEntries === undefined) {
					currentEntries = loadAndCache(resourceType);
				}
				const newEntries = [...currentEntries, entry];
				saveData(resourceType, newEntries);
				return { ...state, [resourceType]: newEntries };
			});
		},
		addMultipleAnimalEntries: (
			resourceType: ResourceType,
			entriesToAdd: Omit<AnimalEntry, 'id' | 'timestamp'>[]
		) => {
			const newEntries = entriesToAdd.map((e) => ({
				...e,
				id: crypto.randomUUID(),
				timestamp: new Date().toISOString()
			}));

			update((state) => {
				let currentEntries = state[resourceType] || [];
				if (currentEntries === undefined) {
					currentEntries = loadAndCache(resourceType);
				}
				const updatedEntries = [...currentEntries, ...newEntries];
				saveData(resourceType, updatedEntries);
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

				saveData(resourceType, newEntries);
				return { ...state, [resourceType]: newEntries };
			});
		}
		/**
		 * Initializes the store with all resource types and their entries
		 * Loads data from localStorage for each resource type
		 */
		// initializeAll: () => {
		//     const initialState = createInitialState();
		//     resources.forEach(resource => {
		//         const type = resource.type as ResourceType;
		//         initialState[type] = loadResourceEntries(type);
		//     });
		//     set(initialState);
		// }
	};
}

// Export the singleton instance of the resource store
export const resourceStore = createResourceStore();
