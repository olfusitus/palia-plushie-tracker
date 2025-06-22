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
		const activeProfile = await this.repository.getActiveProfileName();
		const allData: ExportData['data'] = {};

		for (const profile of profiles) {
			allData[profile] = {} as Record<ResourceType, ResourceEntry[]>;
			for (const resourceType of resourceTypes) {
				const entries = await this.repository.getEntries(resourceType, profile);
				if (entries.length > 0) {
					allData[profile][resourceType] = entries;
				}
			}
		}
		return this.serializer.serialize({
			activeProfile,
			profiles,
			data: allData
		});
	}

	async importData(jsonString: string): Promise<void> {
		const importData = this.serializer.deserialize(jsonString);

		const oldProfiles = await this.repository.getProfiles();
		for (const profile of oldProfiles) {
			await this.repository.deleteProfileData(profile);
		}

		await this.repository.saveProfiles(importData.profiles);
		await this.repository.setActiveProfileName(importData.activeProfile);

		for (const profile of importData.profiles) {
			const profileData = importData.data[profile];
			if (profileData) {
				for (const resourceType of resourceTypes) {
					const entries = profileData[resourceType];
					if (entries) {
						await this.repository.saveEntries(resourceType, profile, entries);
					}
				}
			}
		}
	}
}
