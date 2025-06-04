import { getProfiles, setActiveProfile } from '../profile';
import { loadDataWithoutProfile, saveData, getStorageKeyWithoutProfile } from '../storage';
import type { ResourceType } from '../storage';

const DEFAULT_PROFILE = 'default';

export function migratePaliaData() {
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
