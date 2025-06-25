import { beforeEach, describe, expect, it } from 'vitest';
import { IndexedDBRepository } from './IndexedDBRepository';
import { type ResourceEntry, type ResourceType } from './types';
import 'fake-indexeddb/auto';

describe('IndexedDBRepository', () => {
  let repo: IndexedDBRepository;
  const resourceType: ResourceType = 'animal_chapaa';
  const profile = 'testProfile';
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

  it('should save and retrieve entries', async () => {
    await repo.saveEntries(resourceType, profile, entries);
    const result = await repo.getEntries(resourceType, profile);
    expect(result).toEqual(entries);
  });

  it('should return empty array for non-existent profile', async () => {
    const result = await repo.getEntries(resourceType, 'nonexistent');
    expect(result).toEqual([]);
  });

  it('should save and retrieve profiles', async () => {
    await repo.saveProfiles(['foo', 'bar']);
    const profiles = await repo.getProfiles();
    expect(profiles).toEqual(['foo', 'bar']);
  });

  it('should set and get active profile name', async () => {
    await repo.setActiveProfileName('activeProfile');
    const active = await repo.getActiveProfileName();
    expect(active).toBe('activeProfile');
  });

  it('should default to "default" if no active profile is set', async () => {
    const active = await repo.getActiveProfileName();
    expect(active).toBe('default');
  });

  it('should delete profile data and update profiles', async () => {
    await repo.saveProfiles([profile, 'other']);
    await repo.saveEntries(resourceType, profile, entries);
    await repo.setActiveProfileName(profile);

    await repo.deleteProfileData(profile);

    const profiles = await repo.getProfiles();
    expect(profiles).toContain('other');
    expect(profiles).not.toContain(profile);

    const result = await repo.getEntries(resourceType, profile);
    expect(result).toEqual([]);

    const active = await repo.getActiveProfileName();
    expect(active).toBe('default');
  });

  it('should rename profile data and update profiles', async () => {
    await repo.saveProfiles([profile, 'other']);
    await repo.saveEntries(resourceType, profile, entries);
    await repo.setActiveProfileName(profile);

    await repo.renameProfileData(profile, 'renamedProfile');

    const profiles = await repo.getProfiles();
    expect(profiles).toContain('renamedProfile');
    expect(profiles).not.toContain(profile);

    const oldResult = await repo.getEntries(resourceType, profile);
    expect(oldResult).toEqual([]);

    const newResult = await repo.getEntries(resourceType, 'renamedProfile');
    expect(newResult).toEqual(entries);

    const active = await repo.getActiveProfileName();
    expect(active).toBe('renamedProfile');
  });

  it('should initialize with default profile if all profiles are deleted', async () => {
    await repo.saveProfiles([profile]);
    await repo.deleteProfileData(profile);
    const profiles = await repo.getProfiles();
    expect(profiles).toEqual(['default']);
  });
});
