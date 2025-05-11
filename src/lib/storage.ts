import { getActiveProfile } from './profile';

export type ResourceSize = 'small' | 'medium' | 'large';

export interface ResourceEntry {
	timestamp: string;
	type: ResourceSize;
	rareDrops: number;
}

export type ResourceType =
	| 'ore_silver'
	| 'ore_gold'
	| 'animal_chapaa'
	| 'animal_sernuk'
	| 'animal_muujin';

export interface Resource {
	type: ResourceType;
	name: string;
	sizes: Record<string, number[]>; // z.B. { small: [0, 1], medium: [0, 1, 2] }
	labels: Record<string, string>; // z.B. { small: 'S', medium: 'M' }
}

export const STORAGE_KEYS: Record<ResourceType, string> = {
	ore_silver: 'palia_tracker_ores_silver',
	ore_gold: 'palia_tracker_ores_gold',
	animal_chapaa: 'palia_tracker_animals_chapaa',
	animal_sernuk: 'palia_tracker_animals_sernuk',
	animal_muujin: 'palia_tracker_animals_muujin'
};

const CURRENT_VERSION = 3;
interface StoredData {
	version: number;
	data: ResourceEntry[];
}

function getStorageKey(resourceType: ResourceType): string {
	const activeProfile = getActiveProfile();
	return `${activeProfile}_${STORAGE_KEYS[resourceType]}`;
}

export function getStorageKeyWithoutProfile(resourceType: ResourceType): string {
	return `${STORAGE_KEYS[resourceType]}`;
}

export function loadDataWithoutProfile(resourceType: ResourceType): ResourceEntry[] {
	if (typeof localStorage === 'undefined') return [];

	const raw = localStorage.getItem(STORAGE_KEYS[resourceType]);
	if (!raw) return [];

	const parsed = JSON.parse(raw);

	return parsed.data;

	// if (parsed.version === CURRENT_VERSION) {
	//     return parsed.data;
	// } else {
	//     console.warn(`Veraltete Version für ${resourceType}:`, parsed.version);
	//     return []; // optional: automatische Migration ergänzen
	// }
}

export function loadData(resourceType: ResourceType): ResourceEntry[] {
	if (typeof localStorage === 'undefined') return [];

	const raw = localStorage.getItem(getStorageKey(resourceType));
	if (!raw) return [];

	const parsed = JSON.parse(raw);

	if (parsed.version === CURRENT_VERSION) {
		return parsed.data;
	} else {
		console.warn(`Veraltete Version für ${resourceType}:`, parsed.version);
		return []; // optional: automatische Migration ergänzen
	}
}

export function saveData(resourceType: ResourceType, data: ResourceEntry[]) {
	const storedData: StoredData = {
		version: CURRENT_VERSION,
		data
	};
	localStorage.setItem(getStorageKey(resourceType), JSON.stringify(storedData));
}

export function addEntry(resourceType: ResourceType, size: ResourceSize, rareDrops: number) {
	const data = loadData(resourceType);
	data.push({ timestamp: new Date().toISOString(), type: size, rareDrops });
	saveData(resourceType, data);
}

export function exportCSV(resourceType: ResourceType): string {
	const data = loadData(resourceType);
	const rows = [
		'Zeitstempel,Größe,Rare Drops',
		...data.map((e) => `${e.timestamp},${e.type},${e.rareDrops}`)
	];
	return rows.join('\n');
}
