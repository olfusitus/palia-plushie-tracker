import { storageService } from '$lib/storage/index';
import type { Profile } from '$lib/storage/types';

export async function getActiveProfileId(): Promise<string | null> {
	return await storageService.repository.getActiveProfileId();
}

export async function setActiveProfileId(profileId: string): Promise<void> {
	await storageService.repository.setActiveProfileId(profileId);
}

export async function getProfiles(): Promise<Profile[]> {
	return await storageService.repository.getProfiles();
}

export async function addProfile(name: string): Promise<Profile> {
	const profiles = await getProfiles();
	if (profiles.some(p => p.name === name)) {
		throw new Error(`Profil "${name}" existiert bereits.`);
	}
	return await storageService.repository.addProfile(name);
}

export async function deleteProfile(profileId: string): Promise<void> {
	const profiles = await getProfiles();

	if (!profiles.some(p => p.id === profileId)) {
		throw new Error(`Profile with ID "${profileId}" does not exist.`);
	}
	if (profiles.length === 1) {
		throw new Error('Cannot delete the last remaining profile.');
	}

	// Check if we're deleting the active profile
	const activeProfileId = await getActiveProfileId();
	const isDeletingActive = activeProfileId === profileId;

	await storageService.repository.deleteProfile(profileId);

	// If we deleted the active profile, switch to the first available profile
	if (isDeletingActive) {
		const remainingProfiles = await getProfiles();
		if (remainingProfiles.length > 0) {
			await setActiveProfileId(remainingProfiles[0].id);
		}
	}
}

export async function renameProfile(profileId: string, newName: string): Promise<void> {
	newName = newName.trim();
	if (!newName) {
		throw new Error('New profile name cannot be empty.');
	}

	const profiles = await getProfiles();
	const profile = profiles.find(p => p.id === profileId);
	if (!profile) {
		throw new Error(`Profile with ID "${profileId}" does not exist.`);
	}
	if (profile.name === newName) {
		return; // Nothing to do.
	}
	if (profiles.some(p => p.name === newName)) {
		throw new Error(`Profile "${newName}" already exists.`);
	}

	await storageService.repository.renameProfile(profileId, newName);
}

// Updated to return the full Profile object
export async function getActiveProfile(): Promise<Profile | null> {
	const activeProfileId = await getActiveProfileId();
	if (!activeProfileId) return null;
	
	const profiles = await getProfiles();
	return profiles.find(p => p.id === activeProfileId) || null;
}

// Updated to accept Profile object or profile ID
export async function setActiveProfile(profileOrId: Profile | string): Promise<void> {
	if (typeof profileOrId === 'string') {
		// If it's a string, treat it as a profile name and find the corresponding profile
		const profiles = await getProfiles();
		const profile = profiles.find(p => p.name === profileOrId);
		if (!profile) {
			throw new Error(`Profile "${profileOrId}" does not exist.`);
		}
		await setActiveProfileId(profile.id);
	} else {
		// If it's a Profile object, use its ID
		await setActiveProfileId(profileOrId.id);
	}
}

// Legacy function for backward compatibility - returns the active profile name
export async function getActiveProfileName(): Promise<string> {
	const activeProfile = await getActiveProfile();
	return activeProfile?.name || 'default';
}

// Legacy function for backward compatibility - sets active profile by name
export async function setActiveProfileByName(profileName: string): Promise<void> {
	await setActiveProfile(profileName);
}
