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

		// Delete all existing profiles and their data
		const oldProfiles = await this.repository.getProfiles();
		for (const profile of oldProfiles) {
			await this.repository.deleteProfile(profile.id);
		}

		// Import profiles and create a mapping from original IDs to new IDs
		const profileIdMapping: Record<string, string> = {};
		for (const profile of importData.profiles) {
			const newProfile = await this.repository.addProfile(profile.name);
			profileIdMapping[profile.id] = newProfile.id;
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
