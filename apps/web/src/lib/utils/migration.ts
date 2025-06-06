import type { StoredData } from '../storage/types';
import type { ResourceEntry } from '../storage/types';

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
