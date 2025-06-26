import { beforeEach, describe, expect, it } from 'vitest';
import { IndexedDBRepository } from './IndexedDBRepository';
import { type ResourceEntry, type ResourceType } from './types';
import 'fake-indexeddb/auto';

describe('IndexedDBRepository', () => {
	let repo: IndexedDBRepository;
	const resourceType: ResourceType = 'animal_chapaa';
	const entries: ResourceEntry[] = [
		{ id: '1', timestamp: '2024-01-01T00:00:00Z', rareDrops: 0, type: 'small' },
		{ id: '2', timestamp: '2024-01-02T00:00:00Z', rareDrops: 1, type: 'medium' }
	];

	beforeEach(async () => {
		repo = new IndexedDBRepository();
		// Clean up before each test
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const db = await (repo as any).getDB();
		for (const store of db.objectStoreNames) {
			const tx = db.transaction(store, 'readwrite');
			await tx.objectStore(store).clear();
			await tx.done;
		}
	});

	it('should add and retrieve entries', async () => {
		const profile = await repo.addProfile('testProfile');

		// Add entries one by one
		for (const entry of entries) {
			await repo.addEntry(resourceType, profile.id, entry);
		}

		const result = await repo.getEntries(resourceType, profile.id);
		expect(result).toEqual(entries);
	});

	it('should return empty array for non-existent profile', async () => {
		const result = await repo.getEntries(resourceType, 'nonexistent-id');
		expect(result).toEqual([]);
	});

	it('should add and retrieve profiles', async () => {
		await repo.addProfile('foo');
		await repo.addProfile('bar');

		const profiles = await repo.getProfiles();
		expect(profiles).toHaveLength(2);
		expect(profiles.some((p) => p.name === 'foo')).toBe(true);
		expect(profiles.some((p) => p.name === 'bar')).toBe(true);
	});

	it('should set and get active profile ID', async () => {
		const profile = await repo.addProfile('activeProfile');
		await repo.setActiveProfileId(profile.id);
		const activeId = await repo.getActiveProfileId();
		expect(activeId).toBe(profile.id);
	});

	it('should return null if no active profile is set', async () => {
		const active = await repo.getActiveProfileId();
		expect(active).toBe(null);
	});

	it('should delete profile and all its data', async () => {
		const profile1 = await repo.addProfile('testProfile');
		const profile2 = await repo.addProfile('otherProfile');

		// Add entries to both profiles
		await repo.addEntry(resourceType, profile1.id, entries[0]);
		await repo.addEntry(resourceType, profile2.id, entries[1]);

		await repo.setActiveProfileId(profile1.id);

		await repo.deleteProfile(profile1.id);

		const profiles = await repo.getProfiles();
		expect(profiles).toHaveLength(1);
		expect(profiles[0].name).toBe('otherProfile');

		const result = await repo.getEntries(resourceType, profile1.id);
		expect(result).toEqual([]);

		const active = await repo.getActiveProfileId();
		expect(active).toBe(profile2.id); // Should switch to the remaining profile
	});

	it('should rename profile', async () => {
		const profile = await repo.addProfile('oldName');
		await repo.addEntry(resourceType, profile.id, entries[0]);
		await repo.setActiveProfileId(profile.id);

		await repo.renameProfile(profile.id, 'newName');

		const profiles = await repo.getProfiles();
		const renamedProfile = profiles.find((p) => p.id === profile.id);
		expect(renamedProfile?.name).toBe('newName');

		const result = await repo.getEntries(resourceType, profile.id);
		expect(result).toEqual([entries[0]]);

		const active = await repo.getActiveProfileId();
		expect(active).toBe(profile.id);
	});

	it('should delete individual entries', async () => {
		const profile = await repo.addProfile('testProfile');

		// Add entries
		for (const entry of entries) {
			await repo.addEntry(resourceType, profile.id, entry);
		}

		// Delete one entry
		await repo.deleteEntry(entries[0].id);

		const result = await repo.getEntries(resourceType, profile.id);
		expect(result).toEqual([entries[1]]);
	});

	it('should import profile data', async () => {
		const profile = await repo.addProfile('testProfile');
		const profileData: Record<ResourceType, ResourceEntry[]> = {
			[resourceType]: entries,
			bug_rtb: [{ id: '3', timestamp: '2024-01-03T00:00:00Z', rareDrops: 0 }],
			animal_sernuk: [],
			animal_muujin: [],
			animal_ogopuu: [],
			animal_shmole: [],
			bug_ladybug: [],
			bug_snail: [],
			bug_lunar_fairy_moth: [],
			bug_proudhorn_beetle: [],
			bug_lanternbug: []
		};

		// Use the new importFullDatabase method
		const exportData = {
			version: 1,
			activeProfileId: profile.id,
			profiles: [profile],
			data: {
				[profile.id]: profileData
			}
		};

		await repo.importFullDatabase(exportData);

		const animalEntries = await repo.getEntries(resourceType, profile.id);
		const bugEntries = await repo.getEntries('bug_rtb', profile.id);

		expect(animalEntries).toEqual(entries);
		expect(bugEntries).toEqual([{ id: '3', timestamp: '2024-01-03T00:00:00Z', rareDrops: 0 }]);
	});

	it('should handle profile deletion when it is the active profile', async () => {
		const profile1 = await repo.addProfile('profile1');
		await repo.addProfile('profile2');

		await repo.setActiveProfileId(profile1.id);

		// Delete the active profile
		await repo.deleteProfile(profile1.id);

		const active = await repo.getActiveProfileId();
		expect(active).toBeTruthy(); // Should switch to the remaining profile
	});

	it('should throw error when trying to delete the last profile', async () => {
		const profile = await repo.addProfile('lastProfile');

		await expect(repo.deleteProfile(profile.id)).rejects.toThrow(
			'Cannot delete the last remaining profile'
		);
	});

	it('should throw error when trying to rename to existing name', async () => {
		const profile1 = await repo.addProfile('name1');
		await repo.addProfile('name2');

		await expect(repo.renameProfile(profile1.id, 'name2')).rejects.toThrow(
			'A profile with the name "name2" already exists'
		);
	});

	it('should handle multiple resource types for the same profile', async () => {
		const profile = await repo.addProfile('testProfile');

		await repo.addEntry('animal_chapaa', profile.id, entries[0]);
		await repo.addEntry('bug_rtb', profile.id, {
			id: '3',
			timestamp: '2024-01-03T00:00:00Z',
			rareDrops: 0
		});

		const animalEntries = await repo.getEntries('animal_chapaa', profile.id);
		const bugEntries = await repo.getEntries('bug_rtb', profile.id);

		expect(animalEntries).toEqual([entries[0]]);
		expect(bugEntries).toEqual([{ id: '3', timestamp: '2024-01-03T00:00:00Z', rareDrops: 0 }]);
	});
});
