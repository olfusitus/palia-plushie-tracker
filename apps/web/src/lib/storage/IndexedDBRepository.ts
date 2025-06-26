import { openDB, type IDBPDatabase } from 'idb';
import type { IStorageRepository } from './repository';
import {
	type ResourceEntry,
	type ResourceType,
	type Profile,
	type ExportData
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
							db.createObjectStore('entries', { keyPath: 'id' }).createIndex('by_profile_resource', ['profileId', 'resourceType']);
							db.createObjectStore('profiles', { keyPath: 'id' });
							db.createObjectStore('settings', { keyPath: 'key' });

							// 4. Transformiere und schreibe die Daten in die neuen Stores.
							// In der upgrade-Funktion:
							const newProfiles: Profile[] = oldProfilesList.map((name: string) => ({ id: crypto.randomUUID(), name }));
							const activeProfile =
								newProfiles.find((p) => p.name === oldActiveProfileName) ||
								newProfiles.find((p) => p.name === 'default');

							const writePromises: Promise<IDBValidKey>[] = [];

							// 1. Profile, Einstellungen und Einträge zur Transaktion hinzufügen (ohne await in der Schleife!)
							newProfiles.forEach((profile) => {
								writePromises.push(transaction.objectStore('profiles').add(profile));
							});

							if (activeProfile) {
								writePromises.push(
									transaction
										.objectStore('settings')
										.add({ key: 'activeProfileId', value: activeProfile.id })
								);
							}

							oldData.forEach((data) => {
								const profileId = newProfiles.find((p) => p.name === data.profile)?.id;
								if (profileId) {
									data.entries.forEach((entry) => {
										const enrichedEntry = {
											...entry,
											profileId,
											resourceType: data.resourceType
										};
										// Stelle sicher, dass die versionierte Migration hier stattfindet, falls nötig
										// z.B. enrichedEntry.version = CURRENT_VERSION;
										writePromises.push(transaction.objectStore('entries').add(enrichedEntry));
									});
								}
							});

							// 2. Warte, bis alle Schreiboperationen in der Transaktion abgeschlossen sind.
							// Die Transaktion wird automatisch committet, wenn die upgrade-Funktion endet.
							// Wir warten hier auf die Promises, um sicherzustellen, dass alles durch ist, bevor die Migration als "erfolgreich" gilt.
							await Promise.all(writePromises);

							console.log('Database migration to v2 (batched) completed.');
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
		if (profiles.length == 1) {
			throw new Error("Cannot delete the last remaining profile");
		}

		const tx = db.transaction(['profiles', 'entries', 'settings'], 'readwrite');
		const profilesStore = tx.objectStore('profiles');
		const entriesStore = tx.objectStore('entries');
		const settingsStore = tx.objectStore('settings');

		const index = entriesStore.index('by_profile_resource');
		const keyRange = IDBKeyRange.bound([profileId, ''], [profileId, '\uffff']);
		const profileEntries = await index.getAll(keyRange);
		console.log("index ", index);
		console.log("profileentries size: ", profileEntries.length);
		const deletePromises: Promise<IDBValidKey | void>[] = [];

		for (const entry of profileEntries) {
			deletePromises.push(entriesStore.delete(entry.id));
		}

		// Delete the profile
		deletePromises.push(profilesStore.delete(profileId));

		// If this was the active profile, set the first remaining profile as active
		const activeProfileId = await settingsStore.get('activeProfileId').then(s => s?.value);
		if (activeProfileId === profileId) {
			const remainingProfiles = profiles.filter(p => p.id !== profileId);
			const firstRemainingProfile = remainingProfiles[0];
			if (firstRemainingProfile) {
				deletePromises.push(settingsStore.put({ key: 'activeProfileId', value: firstRemainingProfile.id }));
			} else {
				// No profiles left, clear the active profile setting
				deletePromises.push(settingsStore.delete('activeProfileId'));
			}
		}

		await Promise.all(deletePromises);
		await tx.done;
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

	async importFullDatabase(data: ExportData): Promise<void> {
		const db = await this.getDB();
		// Erstelle eine einzige Transaktion für alle Stores, die wir bearbeiten
		const tx = db.transaction(['profiles', 'settings', 'entries'], 'readwrite');

		const profilesStore = tx.objectStore('profiles');
		const settingsStore = tx.objectStore('settings');
		const entriesStore = tx.objectStore('entries');

		// 1. Leere alle Stores
		await profilesStore.clear();
		await settingsStore.clear();
		await entriesStore.clear();

		// 2. Queue alle neuen Schreibvorgänge
		const writePromises: Promise<IDBValidKey>[] = [];

		// Schreibe Profile
		data.profiles.forEach((profile: Profile) => {
			writePromises.push(profilesStore.put(profile));
		});

		// Schreibe Einstellungen
		writePromises.push(settingsStore.put({ key: 'activeProfileId', value: data.activeProfileId }));

		// Schreibe Einträge
		for (const profileId in data.data) {
			const profileResources = data.data[profileId];
			for (const resourceType in profileResources) {
				const entries = profileResources[resourceType as ResourceType];
				entries.forEach((entry: ResourceEntry) => {
					writePromises.push(
						entriesStore.put({
							...entry,
							profileId: profileId,
							resourceType: resourceType as ResourceType
						})
					);
				});
			}
		}

		// 3. Führe die Transaktion aus, indem du auf ihr Abschluss-Promise wartest
		await Promise.all(writePromises);
		await tx.done;

		console.log('Full database import completed successfully.');
	}
}
