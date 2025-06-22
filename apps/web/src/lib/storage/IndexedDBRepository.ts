import { migrateData } from '$lib/utils/migration';
import { openDB, type IDBPDatabase } from 'idb';
import type { IStorageRepository } from './repository';
import {
	CURRENT_VERSION,
	type ResourceEntry,
	type ResourceType,
	type StoredData
} from './types';

const DB_NAME = 'palia_tracker_db';
const DB_VERSION = 1;

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
		if (typeof window === 'undefined' || !window.indexedDB) {
			throw new Error('IndexedDB is not available in this environment.');
		}
		if (!this.dbPromise) {
			this.dbPromise = openDB(DB_NAME, DB_VERSION, {
				upgrade(db) {
					// Für jedes ResourceType eine eigene ObjectStore anlegen
					for (const type of RESOURCE_TYPES) {
						if (!db.objectStoreNames.contains(type)) {
							db.createObjectStore(type, { keyPath: 'profile' });
						}
					}

					// Extra Store für Profile + ActiveProfile
					if (!db.objectStoreNames.contains('profiles')) {
						db.createObjectStore('profiles', { keyPath: 'id' });
					}
				}
			});
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
