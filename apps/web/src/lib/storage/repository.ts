import type { Profile, ResourceEntry, ResourceType, ExportData } from '$lib/storage/types';

/**
 * Defines the contract for any storage implementation.
 * The application will interact with this interface, not a concrete class.
 */
export interface IStorageRepository {
	/**
	 * Retrieves all entries for a given resource type and profile.
	 * @param resourceType The type of resource to load.
	 * @param profileId The profile ID.
	 * @returns An array of resource entries.
	 */
	getEntries(resourceType: ResourceType, profileId: string): Promise<ResourceEntry[]>;

	/**
	 * Adds a single entry for a given resource type and profile.
	 * @param resourceType The type of resource.
	 * @param profileId The profile ID.
	 * @param entry The entry to add.
	 */
	addEntry(resourceType: ResourceType, profileId: string, entry: ResourceEntry): Promise<void>;

	/**
	 * Deletes a single entry by its ID.
	 * @param entryId The unique ID of the entry to delete.
	 */
	deleteEntry(entryId: string): Promise<void>;

	/**
	 * Retrieves all profiles.
	 * @returns An array of Profile objects.
	 */
	getProfiles(): Promise<Profile[]>;

	/**
	 * Adds a new profile.
	 * @param name The name for the new profile.
	 * @returns The created Profile object.
	 */
	addProfile(name: string): Promise<Profile>;

	/**
	 * Deletes a profile and all its associated data.
	 * @param profileId The ID of the profile to delete.
	 */
	deleteProfile(profileId: string): Promise<void>;

	/**
	 * Renames a profile.
	 * @param profileId The ID of the profile to rename.
	 * @param newName The new name for the profile.
	 */
	renameProfile(profileId: string, newName: string): Promise<void>;

	/**
	 * Gets the currently active profile ID.
	 * @returns The ID of the currently active profile, or null if none is set.
	 */
	getActiveProfileId(): Promise<string | null>;

	/**
	 * Sets the new active profile ID.
	 * @param profileId The ID of the profile to set as active.
	 */
	setActiveProfileId(profileId: string): Promise<void>;

	/**
	 * Replaces the entire database content with the provided data.
	 * This is a destructive operation used for importing a full backup.
	 * @param data The complete data set to import.
	 */
	importFullDatabase(data: ExportData): Promise<void>;
}

// DummyRepository für SSR oder Umgebungen ohne IndexedDB
export class DummyRepository implements IStorageRepository {
	async getEntries(): Promise<ResourceEntry[]> {
		return [];
	}
	async addEntry(): Promise<void> {}
	async deleteEntry(): Promise<void> {}
	async getProfiles(): Promise<Profile[]> {
		return [{ id: 'default', name: 'default' }];
	}
	async addProfile(name: string): Promise<Profile> {
		return { id: 'dummy', name };
	}
	async deleteProfile(): Promise<void> {}
	async renameProfile(): Promise<void> {}
	async getActiveProfileId(): Promise<string | null> {
		return 'default';
	}
	async setActiveProfileId(): Promise<void> {}
	async importFullDatabase(): Promise<void> {}
}