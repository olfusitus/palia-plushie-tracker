import type { ExportData } from './types';

const CURRENT_EXPORT_VERSION = 2;
const SUPPORTED_IMPORT_VERSIONS = [1, CURRENT_EXPORT_VERSION] as const;

function normalizeLegacyV1Export(data: unknown): ExportData | null {
	if (!data || typeof data !== 'object') {
		return null;
	}

	const legacyData = data as {
		version?: unknown;
		activeProfile?: unknown;
		profiles?: unknown;
		data?: unknown;
	};

	if (
		legacyData.version !== 1 ||
		typeof legacyData.activeProfile !== 'string' ||
		!Array.isArray(legacyData.profiles) ||
		!legacyData.profiles.every((profile) => typeof profile === 'string') ||
		!legacyData.data ||
		typeof legacyData.data !== 'object'
	) {
		return null;
	}

	return {
		version: CURRENT_EXPORT_VERSION,
		activeProfileId: legacyData.activeProfile,
		profiles: legacyData.profiles.map((profileName) => ({
			id: profileName,
			name: profileName
		})),
		data: legacyData.data as ExportData['data']
	};
}

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
		const normalizedLegacyData = normalizeLegacyV1Export(data);

		if (!data || typeof data !== 'object') {
			throw new Error('Invalid import data: Not an object.');
		}
		if (!SUPPORTED_IMPORT_VERSIONS.includes(data.version)) {
			throw new Error(
				`Unsupported export version: ${data.version}. Expected one of ${SUPPORTED_IMPORT_VERSIONS.join(', ')}.`
			);
		}
		if (normalizedLegacyData) {
			return normalizedLegacyData;
		}
		if (
			typeof data.activeProfileId !== 'string' ||
			!Array.isArray(data.profiles) ||
			!data.data ||
			typeof data.data !== 'object'
		) {
			throw new Error('Invalid import data: Missing required fields.');
		}

		// Hier könnte eine tiefere Validierung mit Zod o.ä. erfolgen.
		return {
			...data,
			version: CURRENT_EXPORT_VERSION
		} as ExportData;
	}
}
