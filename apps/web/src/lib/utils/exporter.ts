import { get } from 'svelte/store';
import { resourceStore } from '$lib/stores/resourceStore';
import type { ResourceType } from '$lib/storage/types';

export function exportResourceAsCSV(resourceType: ResourceType): string {
	// 1. Ensure the data is loaded into the store.
	// This makes the function self-sufficient.
	resourceStore.ensureLoaded(resourceType);

	// 2. Get the current data from the store.
	const allData = get(resourceStore);
	const entries = allData[resourceType] || [];

	// 3. Generate the CSV rows.
	const headers = ['id', 'timestamp', 'type', 'rareDrops'];
	const rows = [
		headers.join(','), // CSV header row
		...entries.map((entry) => {
			// Gracefully handle both AnimalEntry and BugEntry
			const type = 'type' in entry ? entry.type : 'N/A';
			return [entry.id, entry.timestamp, type, entry.rareDrops].join(',');
		})
	];

	return rows.join('\n');
}

/**
 * Triggers a browser download for any given text content.
 * This is a generic browser utility.
 *
 * @param content The string content to download (e.g., a CSV string).
 * @param filename The desired name for the downloaded file.
 * @param mimeType The MIME type of the file.
 */
export function downloadFile(
	content: string,
	filename: string,
	mimeType = 'text/csv;charset=utf-8;'
) {
	if (typeof window === 'undefined') {
		console.error('Download function can only be run in a browser environment.');
		return;
	}

	const blob = new Blob([content], { type: mimeType });
	const link = document.createElement('a');

	link.href = URL.createObjectURL(blob);
	link.download = filename;

	// This is a more robust way to trigger the click
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(link.href);
}
