import { describe, expect, it } from 'vitest';
import { StorageSerializer } from './storageSerializer';

describe('StorageSerializer', () => {
	it('accepts exports with an empty activeProfileId', () => {
		const serializer = new StorageSerializer();
		const json = JSON.stringify({
			version: 2,
			activeProfileId: '',
			profiles: [{ id: 'profile-1', name: 'Default' }],
			data: {
				'profile-1': {}
			}
		});

		expect(serializer.deserialize(json)).toEqual({
			version: 2,
			activeProfileId: '',
			profiles: [{ id: 'profile-1', name: 'Default' }],
			data: {
				'profile-1': {}
			}
		});
	});

	it('accepts legacy version 1 backups', () => {
		const serializer = new StorageSerializer();
		const json = JSON.stringify({
			version: 1,
			activeProfile: 'profile-1',
			profiles: ['profile-1'],
			data: {
				'profile-1': {
					bug_rtb: [{ id: 'entry-1', timestamp: '2026-03-19T00:00:00.000Z', rareDrops: 1 }]
				}
			}
		});

		expect(serializer.deserialize(json)).toEqual({
			version: 2,
			activeProfileId: 'profile-1',
			profiles: [{ id: 'profile-1', name: 'profile-1' }],
			data: {
				'profile-1': {
					bug_rtb: [{ id: 'entry-1', timestamp: '2026-03-19T00:00:00.000Z', rareDrops: 1 }]
				}
			}
		});
	});
});
