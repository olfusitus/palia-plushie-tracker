export interface BaseResourceEntry {
	id: string;
	timestamp: string;
	rareDrops: number;
}

export type ResourceSize = 'small' | 'medium' | 'large';
export interface SizedEntry extends BaseResourceEntry {
	type: ResourceSize;
}

export type AnimalEntry = SizedEntry;
export type BugEntry = BaseResourceEntry | SizedEntry;
export type FishEntry = BaseResourceEntry;

export type ResourceEntry = AnimalEntry | BugEntry | FishEntry;

export interface Profile {
	id: string;
	name: string;
}

export const resourceTypes = [
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
	'bug_lanternbug',
	'bug_rockhopper',
	'fish_kilima_waters',
	'fish_ponds'
] as const;

export type ResourceType = (typeof resourceTypes)[number];
// export type ResourceType =
// 	| 'animal_chapaa'
// 	| 'animal_sernuk'
// 	| 'animal_muujin'
// 	| 'animal_ogopuu'
// 	| 'animal_shmole'
// 	| 'bug_rtb'
// 	| 'bug_ladybug'
// 	| 'bug_snail'
// 	| 'bug_lunar_fairy_moth'
// 	| 'bug_proudhorn_beetle'
// 	| 'bug_lanternbug';

export const CURRENT_VERSION = 5;
export interface StoredData {
	version: number;
	data: ResourceEntry[];
}

export interface ExportData {
	version: number;
	activeProfileId: string;
	profiles: Profile[];
	data: Record<string, Record<ResourceType, ResourceEntry[]>>;
}
