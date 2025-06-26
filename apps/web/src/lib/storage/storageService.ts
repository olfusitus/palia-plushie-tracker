import type { IStorageRepository } from './repository';
import { StorageSerializer } from './storageSerializer';
import { resourceTypes, type ExportData, type ResourceEntry, type ResourceType } from './types';

export class StorageService {
	public readonly repository: IStorageRepository;
	private serializer: StorageSerializer;

	constructor(repository: IStorageRepository) {
		this.repository = repository;
		this.serializer = new StorageSerializer();
	}

	async exportData(): Promise<string> {
		const profiles = await this.repository.getProfiles();
		const activeProfileId = await this.repository.getActiveProfileId();
		const allData: ExportData['data'] = {};

		for (const profile of profiles) {
			allData[profile.id] = {} as Record<ResourceType, ResourceEntry[]>;
			for (const resourceType of resourceTypes) {
				const entries = await this.repository.getEntries(resourceType, profile.id);
				if (entries.length > 0) {
					allData[profile.id][resourceType] = entries;
				}
			}
		}
		return this.serializer.serialize({
			activeProfileId: activeProfileId || '',
			profiles,
			data: allData
		});
	}

	async importData(jsonString: string): Promise<void> {
		const importData = this.serializer.deserialize(jsonString);

		// Check if we have profiles to import
		if (importData.profiles.length === 0) {
			throw new Error('No profiles found in import data');
		}

		const oldProfiles = await this.repository.getProfiles();
		
		// If we have existing profiles, we need to handle the "last profile" constraint
		if (oldProfiles.length > 0) {
			// If we only have one existing profile and it's the same as the first import profile,
			// we can just rename it instead of deleting and recreating
			if (oldProfiles.length === 1 && importData.profiles.length === 1 && 
				oldProfiles[0].name === importData.profiles[0].name) {
				// Just update the data for the existing profile
				const profileData = importData.data[importData.profiles[0].id];
				if (profileData) {
					await this.repository.importProfileData(oldProfiles[0].id, profileData);
				}
				return;
			}
			
			// Otherwise, we need to delete all profiles except the last one,
			// then delete the last one after creating new profiles
			for (let i = 0; i < oldProfiles.length - 1; i++) {
				await this.repository.deleteProfile(oldProfiles[i].id);
			}
		}

		// Import profiles and create a mapping from original IDs to new IDs
		const profileIdMapping: Record<string, string> = {};
		for (const profile of importData.profiles) {
			const newProfile = await this.repository.addProfile(profile.name);
			profileIdMapping[profile.id] = newProfile.id;
		}

		// Now we can safely delete the last remaining old profile
		if (oldProfiles.length > 0) {
			await this.repository.deleteProfile(oldProfiles[oldProfiles.length - 1].id);
		}

		// Set active profile using the mapped ID
		if (importData.activeProfileId && profileIdMapping[importData.activeProfileId]) {
			await this.repository.setActiveProfileId(profileIdMapping[importData.activeProfileId]);
		}

		// Import data for each profile using importProfileData
		for (const [originalProfileId, profileData] of Object.entries(importData.data)) {
			if (profileData) {
				const newProfileId = profileIdMapping[originalProfileId];
				if (newProfileId) {
					await this.repository.importProfileData(newProfileId, profileData);
				}
			}
		}
	}
}
