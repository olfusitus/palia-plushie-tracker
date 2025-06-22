import type { ResourceEntry, ResourceType } from '$lib/storage/types';

/**
 * Defines the contract for any storage implementation.
 * The application will interact with this interface, not a concrete class.
 */
export interface IStorageRepository {
	/**
	 * Retrieves all entries for a given resource type and profile.
	 * @param resourceType The type of resource to load.
	 * @param profile The active profile name.
	 * @returns An array of resource entries.
	 */
	getEntries(resourceType: ResourceType, profile: string): Promise<ResourceEntry[]>;

	/**
	 * Saves all entries for a given resource type and profile.
	 * @param resourceType The type of resource to save.
	 * @param profile The active profile name.
	 * @param entries The complete array of entries to save.
	 */
	saveEntries(resourceType: ResourceType, profile: string, entries: ResourceEntry[]): Promise<void>;

	/**
	 * Retrieves all profiles.
	 * @returns An array of profile names.
	 */
	getProfiles(): Promise<string[]>;

	/**
	 * Saves the list of profiles.
	 * @param profiles The list of profile names to save.
	 */
	saveProfiles(profiles: string[]): Promise<void>;

	/**
	 * Deletes all data associated with a specific profile.
	 * @param profile The name of the profile to delete.
	 */
	deleteProfileData(profile: string): Promise<void>;

	/**
	 * Renames all data from an old profile name to a new one.
	 * @param oldName The current name of the profile.
	 * @param newName The new name for the profile.
	 */
	renameProfileData(oldName: string, newName: string): Promise<void>;

	/**
	 * Gets the currently active profile name.
	 * @returns The name of the currently active profile.
	 */
	getActiveProfileName(): Promise<string>;

	/**
	 * Sets the new active profile name.
	 * @param profile The name of the profile to set as active.
	 */
	setActiveProfileName(profile: string): Promise<void>;

	// // We can also add methods for import/export to keep all storage logic together.
	// /**
	//  * Exports the entire storage content as a string.
	//  * @returns A string representation of the entire storage content.
	//  */
	// exportAll(): string;

	// /**
	//  * Imports storage content from a string.
	//  * @param data The string representation of the storage content to import.
	//  */
	// importAll(data: string): void;
}

// DummyRepository für SSR oder Umgebungen ohne IndexedDB
export class DummyRepository implements IStorageRepository {
	async getEntries(): Promise<ResourceEntry[]> {
		return [];
	}
	async saveEntries(): Promise<void> {}
	async getProfiles(): Promise<string[]> {
		return ['default'];
	}
	async saveProfiles(): Promise<void> {}
	async getActiveProfileName(): Promise<string> {
		return 'default';
	}
	async setActiveProfileName(): Promise<void> {}
	async deleteProfileData(): Promise<void> {}
	async renameProfileData(): Promise<void> {}
}