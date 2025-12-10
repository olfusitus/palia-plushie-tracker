import { resources } from '$lib/resources';
import type { ResourceType } from '$lib/storage/types';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const resourceType: ResourceType = params.resourceType as ResourceType;
	const resource = resources.find((r) => r.type === resourceType);

	let type: 'animal' | 'bug' | 'fish' | 'mining' | undefined;
	if (resource?.type.startsWith('animal_')) {
		type = 'animal';
	} else if (resource?.type.startsWith('bug_')) {
		type = 'bug';
	} else if (resource?.type.startsWith('fish_')) {
		type = 'fish';
	} else if (resource?.type.startsWith('mining_')) {
		type = 'mining';
	}

	return {
		resourceType,
		type
	};
};
