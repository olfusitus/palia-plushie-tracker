import { openDB, type IDBPDatabase } from 'idb';
import type { IStorageRepository } from './repository';
import {
	type ResourceEntry,
	type ResourceType,
	type Profile
} from './types';
// import { Resource } from '@tauri-apps/api/core';

const DB_NAME = 'palia_tracker_db';
const DB_VERSION = 2;

const RESOURCE_TYPES: ResourceType[] = [
	'animal_chapaa',
	'animal_sernuk',
	'animal_muujin',
	'animal_ogopuu',
	'animal_shmole',
	'bug_rtb',
	'bug_ladybug',
	'bug_snail',
	'bug_lunar_fairy_moth',
	'bug_proudhorn_beetle',
	'bug_lanternbug'
];

export class IndexedDBRepository implements IStorageRepository {
	private dbPromise: Promise<IDBPDatabase> | null = null;

	constructor() {}

	private async getDB() {
		// Use globalThis.indexedDB to support fake-indexeddb in test environments
		const idb = (typeof globalThis !== 'undefined' && globalThis.indexedDB)
			? globalThis.indexedDB
			: undefined;
		if (!idb) {
			throw new Error('IndexedDB is not available in this environment.');
		}
		if (!this.dbPromise) {
			this.dbPromise = openDB(DB_NAME, DB_VERSION, {
				async upgrade(db, oldVersion, newVersion, transaction) {
					console.log(`Upgrading database from version ${oldVersion} to ${newVersion}...`);

					if (oldVersion < 2) {
						// --- MIGRATION VON v1 ZU v2 ---
						
						// Check if this is a fresh database or an existing one
						const hasOldStores = db.objectStoreNames.contains('profiles') || 
							RESOURCE_TYPES.some(type => db.objectStoreNames.contains(type));
						
						if (hasOldStores) {
							// 1. Lese alle Daten aus den alten Stores, bevor sie gelöscht werden.
							const oldData: { profile: string; resourceType: ResourceType; entries: ResourceEntry[] }[] = [];
							const oldProfilesList = (await transaction.objectStore('profiles').get('list'))?.value || ['default'];
							const oldActiveProfileName = (await transaction.objectStore('profiles').get('active'))?.value || 'default';

							for (const resourceType of RESOURCE_TYPES) {
								for (const profileName of oldProfilesList) {
									const record = await transaction.objectStore(resourceType).get(profileName);
									if (record && record.data && record.data.data.length > 0) {
										oldData.push({
											profile: profileName,
											resourceType: resourceType,
											entries: record.data.data // Greife auf die tatsächlichen Einträge zu
										});
									}
								}
							}
							
							// 2. Lösche die alten Object Stores.
							for (const type of RESOURCE_TYPES) {
								if (db.objectStoreNames.contains(type)) {
									db.deleteObjectStore(type);
								}
							}
							if (db.objectStoreNames.contains('profiles')) {
								db.deleteObjectStore('profiles');
							}
							
							// 3. Erstelle die neuen Object Stores.
							const entriesStore = db.createObjectStore('entries', { keyPath: 'id' });
							entriesStore.createIndex('by_profile_resource', ['profileId', 'resourceType']);

							const profilesStore = db.createObjectStore('profiles', { keyPath: 'id' });
							
							const settingsStore = db.createObjectStore('settings', { keyPath: 'key' });

							// 4. Transformiere und schreibe die Daten in die neuen Stores.
							// Erstelle neue Profile mit IDs.
							const newProfiles: Profile[] = oldProfilesList.map((name: string) => ({ id: crypto.randomUUID(), name }));
							const activeProfile = newProfiles.find(p => p.name === oldActiveProfileName) || newProfiles.find(p => p.name === 'default');

							// Speichere die neuen Profile.
							for (const profile of newProfiles) {
								await profilesStore.add(profile);
							}

							// Speichere das aktive Profil.
							if (activeProfile) {
								await settingsStore.add({ key: 'activeProfileId', value: activeProfile.id });
							}

							// Speichere die Einträge mit der neuen profileId.
							for (const data of oldData) {
								const profileId = newProfiles.find(p => p.name === data.profile)?.id;
								if (profileId) {
									for (const entry of data.entries) {
										await entriesStore.add({ ...entry, profileId, resourceType: data.resourceType });
									}
								}
							}
							console.log('Database migration to v2 completed.');
						} else {
							// Fresh database - just create the new stores
							const entriesStore = db.createObjectStore('entries', { keyPath: 'id' });
							entriesStore.createIndex('by_profile_resource', ['profileId', 'resourceType']);

							db.createObjectStore('profiles', { keyPath: 'id' });
							
							db.createObjectStore('settings', { keyPath: 'key' });
							
							console.log('Fresh database created with v2 schema.');
						}
					}
				}
			}); // Pass the detected indexedDB implementation as the 4th argument is not valid
		}
		return await this.dbPromise;
	}

	async getEntries(resourceType: ResourceType, profileId: string): Promise<ResourceEntry[]> {
		const db = await this.getDB();
		const entries = await db.getAllFromIndex('entries', 'by_profile_resource', [profileId, resourceType]);
		return entries.map(entry => ({
			id: entry.id,
			timestamp: entry.timestamp,
			rareDrops: entry.rareDrops,
			...(entry.type && { type: entry.type }) // Only include type if it exists (for AnimalEntry)
		}));
	}

	async addEntry(resourceType: ResourceType, profileId: string, entry: ResourceEntry): Promise<void> {
		const db = await this.getDB();
		const enrichedEntry = {
			...entry,
			profileId,
			resourceType
		};
		await db.add('entries', enrichedEntry);
	}

	async deleteEntry(entryId: string): Promise<void> {
		const db = await this.getDB();
		await db.delete('entries', entryId);
	}

	async getProfiles(): Promise<Profile[]> {
		const db = await this.getDB();
		return await db.getAll('profiles');
	}

	async addProfile(name: string): Promise<Profile> {
		const db = await this.getDB();
		const profile: Profile = {
			id: crypto.randomUUID(),
			name
		};
		await db.add('profiles', profile);
		return profile;
	}

	async deleteProfile(profileId: string): Promise<void> {
		const db = await this.getDB();

		const profiles = await db.getAll('profiles');
		if(profiles.length == 1){
			throw new Error("Cannot delete the last remaining profile");
		}
		// Delete all entries for this profile
		const entries = await db.getAllFromIndex('entries', 'by_profile_resource');
		const profileEntries = entries.filter(entry => entry.profileId === profileId);
		
		for (const entry of profileEntries) {
			await db.delete('entries', entry.id);
		}
		
		// Delete the profile
		await db.delete('profiles', profileId);
		
		// If this was the active profile, set the first remaining profile as active
		const activeProfileId = await this.getActiveProfileId();
		if (activeProfileId === profileId) {
			const remainingProfiles = await this.getProfiles();
			const firstRemainingProfile = remainingProfiles[0];
			if (firstRemainingProfile) {
				await this.setActiveProfileId(firstRemainingProfile.id);
			} else {
				// No profiles left, clear the active profile setting
				await db.delete('settings', 'activeProfileId');
			}
		}
	}

	async renameProfile(profileId: string, newName: string): Promise<void> {
		const db = await this.getDB();
		const profile = await db.get('profiles', profileId);
		if (!profile) {
			throw new Error(`Profile with ID ${profileId} not found`);
		}
		
		// Check if a profile with the new name already exists
		const existingProfiles = await db.getAll('profiles');
		const nameExists = existingProfiles.some(p => p.id !== profileId && p.name === newName);
		if (nameExists) {
			throw new Error(`A profile with the name "${newName}" already exists`);
		}
		
		await db.put('profiles', { ...profile, name: newName });
	}

	async getActiveProfileId(): Promise<string | null> {
		const db = await this.getDB();
		const setting = await db.get('settings', 'activeProfileId');
		return setting?.value || null;
	}

	async setActiveProfileId(profileId: string): Promise<void> {
		const db = await this.getDB();
		await db.put('settings', { key: 'activeProfileId', value: profileId });
	}

	async importProfileData(profileId: string, data: Record<ResourceType, ResourceEntry[]>): Promise<void> {
		const db = await this.getDB();
		
		// Delete existing entries for this profile
		const existingEntries = await db.getAllFromIndex('entries', 'by_profile_resource');
		const profileEntries = existingEntries.filter(entry => entry.profileId === profileId);
		
		for (const entry of profileEntries) {
			await db.delete('entries', entry.id);
		}
		
		// Add new entries
		for(const [resourceType] of Object.entries(data)){
			console.log(resourceType);
		}
		for (const [resourceType, entries] of Object.entries(data)) {
			console.log("Adding ", entries, " ", resourceType, " Resources.");
			for (const entry of entries) {
				const enrichedEntry = {
					...entry,
					profileId,
					resourceType: resourceType as ResourceType
				};
				await db.add('entries', enrichedEntry);
			}
		}
	}
}
