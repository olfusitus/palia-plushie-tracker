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
		// Rufe die einzelne, gebündelte Importmethode auf
		await this.repository.importFullDatabase(importData);
	}
}
