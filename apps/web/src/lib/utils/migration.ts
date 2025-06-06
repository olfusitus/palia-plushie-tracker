import { getProfiles, setActiveProfile } from '../profile';
import { loadDataWithoutProfile, saveData, getStorageKeyWithoutProfile } from '../storage';
import type { ResourceEntry, ResourceType, StoredData } from '../storage';

const DEFAULT_PROFILE = 'default';

export function migrateData(storedData: StoredData): ResourceEntry[] {
	let migratedEntries = storedData.data;

	// Run migrations sequentially.
	if (storedData.version < 4) {
		migratedEntries = migrateV4_addUUIDs(migratedEntries);
	}

	return migratedEntries;
}

function migrateV4_addUUIDs(entries: ResourceEntry[]): ResourceEntry[] {
	if (!entries) return [];

	return entries.map((entry) => {
		// If an entry already has an ID (e.g., from a partial migration), don't touch it.
		if (entry.id) {
			return entry;
		}
		// Add a new random UUID.
		return { ...entry, id: crypto.randomUUID() };
	});
}

export function migrateToProfiles() {
	const profiles = getProfiles();

	// Wenn keine Profile existieren, migriere bestehende Daten
	if (profiles.length === 1 && profiles[0] === DEFAULT_PROFILE) {
		const resourceTypes: ResourceType[] = ['animal_chapaa', 'animal_sernuk', 'animal_muujin'];

		resourceTypes.forEach((resourceType) => {
			const data = loadDataWithoutProfile(resourceType);

			// Wenn Daten ohne Profil existieren, migriere sie zum Default-Profil
			if (data.length > 0) {
				saveData(resourceType, data); // Speichert unter dem Default-Profil
				localStorage.removeItem(getStorageKeyWithoutProfile(resourceType)); // Löscht die alten Daten
			}
		});

		// Stelle sicher, dass das Default-Profil aktiv ist
		setActiveProfile(DEFAULT_PROFILE);
	}
}
