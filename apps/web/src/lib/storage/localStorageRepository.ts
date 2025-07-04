// TODO: Deprecated, reimplement?
// import { migrateData } from '$lib/utils/migration';
// import type { IStorageRepository } from './repository';
// import {
// 	CURRENT_VERSION,
// 	type ResourceEntry,
// 	type ResourceType,
// 	type StoredData
// 	// type StoredData,
// 	// CURRENT_VERSION,
// 	// STORAGE_KEYS,
// 	// PROFILE_KEY,
// 	// PROFILES_KEY
// } from './types';

// const STORAGE_KEYS: Record<ResourceType, string> = {
// 	animal_chapaa: 'palia_tracker_animals_chapaa',
// 	animal_sernuk: 'palia_tracker_animals_sernuk',
// 	animal_muujin: 'palia_tracker_animals_muujin',
// 	animal_ogopuu: 'palia_tracker_animals_ogopuu',
// 	animal_shmole: 'palia_tracker_animals_shmole',
// 	bug_rtb: 'palia_tracker_bugs_rtb',
// 	bug_ladybug: 'palia_tracker_bugs_ladybug',
// 	bug_snail: 'palia_tracker_bugs_snail',
// 	bug_lunar_fairy_moth: 'palia_tracker_bugs_lunar_fairy_moth',
// 	bug_proudhorn_beetle: 'palia_tracker_bugs_proudhorn_beetle',
// 	bug_lanternbug: 'palia_tracker_bugs_lanternbug'
// };

// const PROFILE_KEY = 'palia_tracker_active_profile';
// const PROFILES_KEY = 'palia_tracker_profiles';

// export class LocalStorageRepository implements IStorageRepository {
// 	async deleteProfileData(profile: string): Promise<void> {
// 		if (typeof localStorage === 'undefined') return;

// 		// Remove all stored data for this profile
// 		const resourceTypes = Object.keys(STORAGE_KEYS) as ResourceType[];
// 		resourceTypes.forEach((resourceType) => {
// 			const key = this.getStorageKey(resourceType, profile);
// 			localStorage.removeItem(key);
// 		});

// 		// If this was the active profile, switch to default
// 		if ((await this.getActiveProfileName()) === profile) {
// 			await this.setActiveProfileName('default');
// 		}

// 		// Ensure default profile exists
// 		const profiles = await this.getProfiles();
// 		if (profiles.length === 0) {
// 			await this.saveProfiles(['default']);
// 		}
// 	}

// 	async renameProfileData(oldName: string, newName: string): Promise<void> {
// 		if (typeof localStorage === 'undefined') return;

// 		// Get all resource types
// 		const resourceTypes = Object.keys(STORAGE_KEYS) as ResourceType[];

// 		// For each resource type, move data from old profile to new profile
// 		resourceTypes.forEach((resourceType) => {
// 			const oldKey = this.getStorageKey(resourceType, oldName);
// 			const newKey = this.getStorageKey(resourceType, newName);
// 			const data = localStorage.getItem(oldKey);

// 			if (data) {
// 				localStorage.setItem(newKey, data);
// 				localStorage.removeItem(oldKey);
// 			}
// 		});

// 		// Update profiles list
// 		const profiles = await this.getProfiles();
// 		const updatedProfiles = profiles.map((profile) => (profile === oldName ? newName : profile));
// 		await this.saveProfiles(updatedProfiles);

// 		// If the renamed profile was active, update active profile
// 		if ((await this.getActiveProfileName()) === oldName) {
// 			await this.setActiveProfileName(newName);
// 		}
// 	}

// 	private getStorageKey(resourceType: ResourceType, profile: string): string {
// 		return `${profile}_${STORAGE_KEYS[resourceType]}`;
// 	}

// 	async getEntries(resourceType: ResourceType, profile: string): Promise<ResourceEntry[]> {
// 		if (typeof localStorage === 'undefined') return [];
// 		const raw = localStorage.getItem(this.getStorageKey(resourceType, profile));
// 		if (!raw) return [];

// 		const parsed: StoredData = JSON.parse(raw);

// 		if (parsed.version < CURRENT_VERSION) {
// 			console.log(
// 				`Outdated data found for ${resourceType} (v${parsed.version}). Migrating to v${CURRENT_VERSION}...`
// 			);
// 			parsed.data = migrateData(parsed);
// 			// After migration, immediately save back to prevent re-migrating.
// 			await this.saveEntries(resourceType, profile, parsed.data);
// 		}

// 		return parsed.data;
// 	}

// 	async saveEntries(
// 		resourceType: ResourceType,
// 		profile: string,
// 		entries: ResourceEntry[]
// 	): Promise<void> {
// 		if (typeof localStorage === 'undefined') return;
// 		const storedData: StoredData = {
// 			version: CURRENT_VERSION,
// 			data: entries
// 		};
// 		localStorage.setItem(this.getStorageKey(resourceType, profile), JSON.stringify(storedData));
// 	}

// 	async getProfiles(): Promise<string[]> {
// 		if (typeof localStorage === 'undefined') return ['default'];
// 		const profiles = localStorage.getItem(PROFILES_KEY);
// 		return profiles ? JSON.parse(profiles) : ['default'];
// 	}

// 	async saveProfiles(profiles: string[]): Promise<void> {
// 		if (typeof localStorage === 'undefined') return;
// 		localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
// 	}

// 	async getActiveProfileName(): Promise<string> {
// 		if (typeof localStorage === 'undefined') return 'default';
// 		return localStorage.getItem(PROFILE_KEY) || 'default';
// 	}

// 	async setActiveProfileName(profile: string): Promise<void> {
// 		if (typeof localStorage === 'undefined') return;
// 		localStorage.setItem(PROFILE_KEY, profile);
// 	}

// 	// exportAll(): string {
// 	// 	if (typeof localStorage === 'undefined') return '{}';
// 	// 	return JSON.stringify(localStorage);
// 	// }

// 	// importAll(data: string): void {
// 	// 	if (typeof localStorage === 'undefined') return;
// 	// 	const parsedData = JSON.parse(data);
// 	// 	// Clear existing storage before import to avoid merging issues
// 	// 	localStorage.clear();
// 	// 	Object.keys(parsedData).forEach((key) => {
// 	// 		localStorage.setItem(key, parsedData[key]);
// 	// 	});
// 	// }
// }
