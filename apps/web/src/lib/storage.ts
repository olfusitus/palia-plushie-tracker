import { getActiveProfile } from './profile';

export type ResourceSize = 'small' | 'medium' | 'large';

export interface OreOrAnimalEntry {
    timestamp: string;
    type: ResourceSize; // 'small' | 'medium' | 'large'
    rareDrops: number;
}

export interface BugEntry {
    timestamp: string;
    rareDrops: number;
}

// export interface ResourceEntry {
// 	timestamp: string;
// 	type: ResourceSize;
// 	rareDrops: number;
// }

export type ResourceEntry = OreOrAnimalEntry | BugEntry;

export type ResourceType =
	| 'animal_chapaa'
	| 'animal_sernuk'
	| 'animal_muujin'
	| 'animal_ogopuu'
	| 'animal_shmole'
	| 'bug_rtb'
    | 'bug_ladybug'
    | 'bug_snail'
    | 'bug_lunar_fairy_moth'
    | 'bug_proudhorn_beetle'
	| 'bug_lanternbug';

export interface AnimalResource {
    type: 'animal_chapaa' | 'animal_sernuk' | 'animal_muujin' | 'animal_ogopuu' | 'animal_shmole';
    name: string;
    sizes: Record<ResourceSize, number[]>;
    labels: Record<ResourceSize, string>;
}

export interface BugResource {
    type: 'bug_rtb' | 'bug_ladybug' | 'bug_snail' | 'bug_lunar_fairy_moth' | 'bug_proudhorn_beetle' | 'bug_lanternbug';
    name: string;
    // Bugs haben keine sizes, nur ein Label
    // label: string;
}

export type Resource = AnimalResource | BugResource; 
// export interface Resource {
// 	type: ResourceType;
// 	name: string;
// 	sizes: Record<string, number[]>; // z.B. { small: [0, 1], medium: [0, 1, 2] }
// 	labels: Record<string, string>; // z.B. { small: 'S', medium: 'M' }
// }

export const STORAGE_KEYS: Record<ResourceType, string> = {
	animal_chapaa: 'palia_tracker_animals_chapaa',
	animal_sernuk: 'palia_tracker_animals_sernuk',
	animal_muujin: 'palia_tracker_animals_muujin',
	animal_ogopuu: 'palia_tracker_animals_ogopuu',
	animal_shmole: 'palia_tracker_animals_shmole',
	bug_rtb: 'palia_tracker_bugs_rtb',
	bug_ladybug: 'palia_tracker_bugs_ladybug',
	bug_snail: 'palia_tracker_bugs_snail',
	bug_lunar_fairy_moth: 'palia_tracker_bugs_lunar_fairy_moth',
	bug_proudhorn_beetle: 'palia_tracker_bugs_proudhorn_beetle',
	bug_lanternbug: 'palia_tracker_bugs_lanternbug'
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

// export function loadResourceEntries(resourceType: ResourceType): ResourceEntry[] {
// 	if (typeof localStorage === 'undefined') return [];

// 	const raw = localStorage.getItem(getStorageKey(resourceType));
// 	// console.log('Roh:', raw);
// 	// console.log(resourceType, getStorageKey(resourceType));
// 	if (!raw) return [];

// 	const parsed = JSON.parse(raw);
// 	// console.log('Rohdaten:', parsed);

// 	if (parsed.version === CURRENT_VERSION) {
// 		// console.log('Rohdaten:', parsed.data);
// 		return parsed.data;
// 	} else {
// 		console.warn(`Veraltete Version für ${resourceType}:`, parsed.version);
// 		return []; // optional: automatische Migration ergänzen
// 	}
// }
export function loadResourceEntries(resourceType: ResourceType): ResourceEntry[] {
	if (typeof localStorage === 'undefined') return [];

	const raw = localStorage.getItem(getStorageKey(resourceType));
	// console.log('Roh:', raw);
	// console.log(resourceType, getStorageKey(resourceType));
	if (!raw) return [];

	const parsed = JSON.parse(raw);
	// console.log('Rohdaten:', parsed);

	if (parsed.version === CURRENT_VERSION) {
		// console.log('Rohdaten:', parsed.data);
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
	const data = loadResourceEntries(resourceType);
	data.push({ timestamp: new Date().toISOString(), type: size, rareDrops });
	saveData(resourceType, data);
}

export function addBugEntry(resourceType: ResourceType, rareDrops: number) {
	const data = loadResourceEntries(resourceType);	
	data.push({ timestamp: new Date().toISOString(), rareDrops });
	saveData(resourceType, data);
}

export function exportCSV(resourceType: ResourceType): string {
	const data = loadResourceEntries(resourceType);
	const rows = [
		'Zeitstempel,Größe,Rare Drops',
		...data.map((e) => {
			const size = 'type' in e ? e.type : '';
			return `${e.timestamp},${size},${e.rareDrops}`;
		})
	];
	return rows.join('\n');
}

export function exportCompleteStorage(): string {
	const data = JSON.stringify(localStorage);
	return data;
}

export function downloadLocalStorage() {
	const data = exportCompleteStorage();
	const blob = new Blob([data], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `huntingTrackerData.json`;
	link.click();
}

export function importLocalStorage(file: File) {
	const reader = new FileReader();
	reader.onload = (event) => {
		if (event.target) {
			const data = JSON.parse(event.target.result as string);
			Object.keys(data).forEach((key) => {
				localStorage.setItem(key, data[key]);
			});
		}
	};
	reader.readAsText(file);
}
