import { resources } from '$lib/resources';
import type { ResourceType } from '$lib/storage/types';

export function load({ params }) {
	const resourceType: ResourceType = params.resourceType as ResourceType;
	const resource = resources.find((r) => r.type === resourceType);

	let type: 'animal' | 'bug' | 'fish' | undefined;
	if (resource?.type.startsWith('animal_')) {
		type = 'animal';
	} else if (resource?.type.startsWith('bug_')) {
		type = 'bug';
	} else if (resource?.type.startsWith('fish_')) {
		type = 'fish';
	}

	return {
		resourceType,
		type
	};
}
