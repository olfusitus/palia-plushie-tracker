import type {
	AnimalEntry,
	BugEntry,
	FishEntry,
	ResourceEntry
} from '$lib/storage/types';

export interface StatResult {
	count: number;
	share: string;
	totalRareDrops: number;
	plushBreakdown: Record<string, number>;
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
function countRareDropTypes(entries: ResourceEntry[]): Record<string, number> {
	return entries.reduce<Record<string, number>>((counts, entry) => {
		if (!entry.rareDropType || entry.rareDrops === 0) {
			return counts;
		}

		counts[entry.rareDropType] = (counts[entry.rareDropType] ?? 0) + entry.rareDrops;
		return counts;
	}, {});
}

function calcStats(werte: number[], plushBreakdown: Record<string, number>): StatResult {
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
		plushBreakdown,
		lowestDistance,
		highestDistance,
		avgDistance,
		allDistances,
		timeSinceLast
	};
}

function getVariantKey(entry: ResourceEntry): string | undefined {
	if (entry.variant) {
		return entry.variant;
	}

	if ('type' in entry && entry.type) {
		return entry.type;
	}

	return undefined;
}

function hasVariantKey(entry: ResourceEntry): boolean {
	return getVariantKey(entry) !== undefined;
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
	if (entries.length > 0 && entries.every(hasVariantKey)) {
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
	if (entries.length > 0 && entries.every(hasVariantKey)) {
		return calculateSizedStats(entries);
	} else {
		return calculateUnsizedStats(entries);
	}
}

function calculateSizedStats(entries: ResourceEntry[]): Record<string, StatResult> {
	const grouped: Record<string, ResourceEntry[]> = {};
	entries.forEach((entry) => {
		const key = getVariantKey(entry);
		if (!key) {
			return;
		}

		if (!grouped[key]) {
			grouped[key] = [];
		}

		grouped[key].push(entry);
	});

	return Object.fromEntries(
		Object.entries(grouped).map(([typ, groupedEntries]) => {
			return [
				typ,
				calcStats(
					groupedEntries.map((entry) => entry.rareDrops),
					countRareDropTypes(groupedEntries)
				)
			];
		})
	);
}
function calculateUnsizedStats(entries: ResourceEntry[]): StatResult {
	const werte = entries.map((e) => e.rareDrops);
	return calcStats(werte, countRareDropTypes(entries));
}
