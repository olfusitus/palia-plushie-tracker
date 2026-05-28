export interface BaseResourceEntry {
	id: string;
	timestamp: string;
	rareDrops: number;
	variant?: string;
	rareDropType?: string;
}

export type ResourceSize = 'small' | 'medium' | 'large';
export interface SizedEntry extends BaseResourceEntry {
	type: string;
}

export interface ResourceEntryInput {
	rareDrops?: number;
	type?: string;
	variant?: string;
	rareDropType?: string;
}

export type AnimalEntry = SizedEntry;
export type BugEntry = BaseResourceEntry | SizedEntry;
export type FishEntry = BaseResourceEntry;
export type MiningEntry = BaseResourceEntry;

export type ResourceEntry = AnimalEntry | BugEntry | FishEntry | MiningEntry;

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
	'animal_jaakcat',
	'bug_rtb',
	'bug_ladybug',
	'bug_snail',
	'bug_lunar_fairy_moth',
	'bug_proudhorn_beetle',
	'bug_lanternbug',
	'bug_fairy_mantis',
	'bug_rockhopper',
	'bug_duskwing',
	'bug_bahari_bee',
	'bug_golden_glory_bee',
	'fish_kilima_waters',
	'fish_ponds',
	'fish_elderwood_waters',
	'mining_obsidian_kitsuu',
	'mining_caldera_kitsuu',
	'mining_rainbow_kitsuu'
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
