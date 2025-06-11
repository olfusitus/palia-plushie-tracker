import type { ExportData } from "./types";

const CURRENT_EXPORT_VERSION = 1;

export class StorageSerializer {
	public serialize(data: Omit<ExportData, 'version'>): string {
		const exportData: ExportData = {
			version: CURRENT_EXPORT_VERSION,
			...data
		};

		return JSON.stringify(exportData, null, 2);
	}

	public deserialize(jsonString: string): ExportData {
		const data = JSON.parse(jsonString);

		if (!data || typeof data !== 'object') {
			throw new Error('Invalid import data: Not an object.');
		}
		if (data.version !== CURRENT_EXPORT_VERSION) {
			throw new Error(`Unsupported export version: ${data.version}. Expected ${CURRENT_EXPORT_VERSION}.`);
		}
		if (
			!data.activeProfile ||
			!Array.isArray(data.profiles) ||
			!data.data ||
			typeof data.data !== 'object'
		) {
			throw new Error('Invalid import data: Missing required fields.');
		}

		// Hier könnte eine tiefere Validierung mit Zod o.ä. erfolgen.
		return data as ExportData;
	}
}