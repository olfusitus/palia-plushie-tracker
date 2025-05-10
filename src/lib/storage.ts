export type OreSize = 'small' | 'medium' | 'large';

export interface Entry {
	timestamp: string;
	type: OreSize;
	gold: number;
}

const STORAGE_KEY = 'palia_ore_tracker_data';

export function loadData(): Entry[] {
	if (typeof localStorage === 'undefined') return [];
	const data = localStorage.getItem(STORAGE_KEY);
	return data ? JSON.parse(data) : [];
}

export function saveData(data: Entry[]) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addEntry(type: OreSize, gold: number) {
	const data = loadData();
	data.push({ timestamp: new Date().toISOString(), type, gold });
	saveData(data);
}

export function exportCSV(): string {
	const data = loadData();
	const rows = [
		'Zeitstempel,Erztyp,Gold',
		...data.map((e) => `${e.timestamp},${e.type},${e.gold}`)
	];
	return rows.join('\n');
}
