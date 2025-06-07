export interface BaseResourceEntry {
	id: string;
	timestamp: string;
	rareDrops: number;
}

export type ResourceSize = 'small' | 'medium' | 'large';
export interface AnimalEntry extends BaseResourceEntry {
	type: ResourceSize;
}

export type BugEntry = BaseResourceEntry;

// export interface AnimalEntry {
// 	id: string;
// 	timestamp: string;
// 	type: ResourceSize; // 'small' | 'medium' | 'large'
// 	rareDrops: number;
// }

// export interface BugEntry {
// 	id: string;
// 	timestamp: string;
// 	rareDrops: number;
// }

export type ResourceEntry = AnimalEntry | BugEntry;

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

export const CURRENT_VERSION = 4;
export interface StoredData {
	version: number;
	data: ResourceEntry[];
}
