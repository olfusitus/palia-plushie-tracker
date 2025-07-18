import type {
	AnimalEntry,
	BugEntry,
	FishEntry,
	ResourceEntry,
	SizedEntry
} from '$lib/storage/types';

export interface StatResult {
	count: number;
	share: string;
	totalRareDrops: number;
	lowestDistance: number;
	highestDistance: number;
	avgDistance: number;
	allDistances: number[];
	timeSinceLast: number;
}

/**
 * Calculates statistics for a given array of values.
 * @param werte - The array of values to process.
 * @returns An object containing the calculated statistics.
 */
function calcStats(werte: number[]): StatResult {
	const count = werte.length;
	const totalRareDrops = werte.reduce((sum, value) => sum + value, 0);
	const share = totalRareDrops ? ((totalRareDrops / count) * 100).toFixed(2) + '%' : '–';

	const rareDropIndices = werte
		.map((val, idx) => (val !== 0 ? idx : -1))
		.filter((idx) => idx !== -1);
	let avgDistance = 0;
	let allDistances: number[] = [];
	let timeSinceLast = 0;
	let lowestDistance = 0;
	let highestDistance = 0;

	if (rareDropIndices.length > 0) {
		timeSinceLast = count - (rareDropIndices[rareDropIndices.length - 1] + 1);
	}
	if (rareDropIndices.length >= 2) {
		allDistances = rareDropIndices.slice(1).map((val, i) => val - rareDropIndices[i]);
		avgDistance = allDistances.reduce((a, b) => a + b, 0) / allDistances.length;
		lowestDistance = Math.min(...allDistances);
		highestDistance = Math.max(...allDistances);
	}
	return {
		count,
		share,
		totalRareDrops,
		lowestDistance,
		highestDistance,
		avgDistance,
		allDistances,
		timeSinceLast
	};
}

function isSizedEntry(entry: BugEntry): entry is SizedEntry {
	return 'type' in entry;
}

/**
 * Calculates statistics for animal entries.
 * @param entries - The array of animal entries to process.
 * @returns An object containing the calculated statistics.
 */
export function calculateAnimalStats(entries: AnimalEntry[]) {
	return calculateSizedStats(entries);
}

/**
 * Calculates statistics for bug entries.
 * @param entries - The array of bug entries to process.
 * @returns An object containing the calculated statistics.
 */
export function calculateBugStats(entries: BugEntry[]): StatResult | Record<string, StatResult> {
	if (entries.every(isSizedEntry)) {
		return calculateSizedStats(entries);
	} else {
		return calculateUnsizedStats(entries);
	}
}

/**
 * Calculates statistics for bug entries.
 * @param entries - The array of bug entries to process.
 * @returns An object containing the calculated statistics.
 */
export function calculateFishStats(entries: FishEntry[]): StatResult {
	return calculateUnsizedStats(entries);
}

export function calculateStats(entries: ResourceEntry[]): StatResult | Record<string, StatResult> {
	if (entries.every(isSizedEntry)) {
		return calculateSizedStats(entries);
	} else {
		return calculateUnsizedStats(entries);
	}
}

function calculateSizedStats(entries: SizedEntry[]): Record<string, StatResult> {
	const grouped: Record<string, number[]> = { small: [], medium: [], large: [] };
	entries.forEach((e: SizedEntry) => {
		grouped[e.type].push(e.rareDrops);
	});

	return Object.fromEntries(
		Object.entries(grouped).map(([typ, werte]) => {
			return [typ, calcStats(werte)];
		})
	);
}
function calculateUnsizedStats(entries: ResourceEntry[]): StatResult {
	const werte = entries.map((e) => e.rareDrops);
	return calcStats(werte);
}
