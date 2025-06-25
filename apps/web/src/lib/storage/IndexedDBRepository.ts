import { migrateData } from '$lib/utils/migration';
import { openDB, type IDBPDatabase } from 'idb';
import type { IStorageRepository } from './repository';
import {
	CURRENT_VERSION,
	type ResourceEntry,
	type ResourceType,
	type StoredData,
	type Profile
} from './types';

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
					}
				}
			}); // Pass the detected indexedDB implementation as the 4th argument is not valid
		}
		return await this.dbPromise;
	}

	async getEntries(resourceType: ResourceType, profile: string): Promise<ResourceEntry[]> {
		const db = await this.getDB();
		const record = await db.get(resourceType, profile);
		if (!record) return [];

		const parsed: StoredData = record.data;

		if (parsed.version < CURRENT_VERSION) {
			console.log(`Outdated data found for ${resourceType}. Migrating...`);
			parsed.data = migrateData(parsed);
			await this.saveEntries(resourceType, profile, parsed.data);
		}

		return parsed.data;
	}

	async saveEntries(resourceType: ResourceType, profile: string, entries: ResourceEntry[]): Promise<void> {
		const db = await this.getDB();
		const storedData: StoredData = {
			version: CURRENT_VERSION,
			data: entries
		};

		await db.put(resourceType, { profile, data: storedData });
	}

	async getProfiles(): Promise<string[]> {
		const db = await this.getDB();
		const profilesRecord = await db.get('profiles', 'list');
		return profilesRecord?.value || ['default'];
	}

	async saveProfiles(profiles: string[]): Promise<void> {
		const db = await this.getDB();
		await db.put('profiles', { id: 'list', value: profiles });
	}

	async getActiveProfileName(): Promise<string> {
		const db = await this.getDB();
		const activeProfile = await db.get('profiles', 'active');
		return activeProfile?.value || 'default';
	}

	async setActiveProfileName(profile: string): Promise<void> {
		const db = await this.getDB();
		await db.put('profiles', { id: 'active', value: profile });
	}

	async deleteProfileData(profile: string): Promise<void> {
		const db = await this.getDB();

		for (const type of RESOURCE_TYPES) {
			await db.delete(type, profile);
		}

		const profiles = await this.getProfiles();
		const updatedProfiles = profiles.filter((p) => p !== profile);
		await this.saveProfiles(updatedProfiles);

		if ((await this.getActiveProfileName()) === profile) {
			await this.setActiveProfileName('default');
		}

		if (updatedProfiles.length === 0) {
			await this.saveProfiles(['default']);
		}
	}

	async renameProfileData(oldName: string, newName: string): Promise<void> {
		const db = await this.getDB();

		for (const type of RESOURCE_TYPES) {
			const record = await db.get(type, oldName);
			if (record) {
				await db.put(type, { profile: newName, data: record.data });
				await db.delete(type, oldName);
			}
		}

		const profiles = await this.getProfiles();
		const updatedProfiles = profiles.map((p) => (p === oldName ? newName : p));
		await this.saveProfiles(updatedProfiles);

		if ((await this.getActiveProfileName()) === oldName) {
			await this.setActiveProfileName(newName);
		}
	}
}
