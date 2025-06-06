import repository from './storage/index';
import type { ResourceSize } from './storage/types';

export interface AnimalResource {
	type: 'animal_chapaa' | 'animal_sernuk' | 'animal_muujin' | 'animal_ogopuu' | 'animal_shmole';
	name: string;
	availableSizes: ResourceSize[];
	labels: Record<ResourceSize, string>;
}

export interface BugResource {
	type:
		| 'bug_rtb'
		| 'bug_ladybug'
		| 'bug_snail'
		| 'bug_lunar_fairy_moth'
		| 'bug_proudhorn_beetle'
		| 'bug_lanternbug';
	name: string;
	// Bugs haben keine sizes, nur ein Label
	// label: string;
}

export type Resource = AnimalResource | BugResource;

export function downloadStorage() {
	const data = repository.exportAll();
	const blob = new Blob([data], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `huntingTrackerData.json`;
	link.click();
}

export function importStorage(file: File) {
	const reader = new FileReader();
	reader.onload = (event) => {
		if (event.target) {
			repository.importAll(event.target.result as string);

		}
	};
	reader.readAsText(file);
}
