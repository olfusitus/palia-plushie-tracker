import { resources } from '$lib/resources';
import type { ResourceType } from '$lib/storage/types';

export function load({ params }) {
	const resourceType: ResourceType = params.resourceType as ResourceType;
	const resource = resources.find((r) => r.type === resourceType);

	let type: 'animal' | 'bug' | undefined;
	if (resource?.type.startsWith('animal_')) {
		type = 'animal';
	} else if (resource?.type.startsWith('bug_')) {
		type = 'bug';
	}

	return {
		resourceType,
		type
	};
}
