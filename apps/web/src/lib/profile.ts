import { storageService } from '$lib/storage/index';

export async function getActiveProfile(): Promise<string> {
	return await storageService.repository.getActiveProfileName();
}

export async function setActiveProfile(profile: string): Promise<void> {
	await storageService.repository.setActiveProfileName(profile);
}

export async function getProfiles(): Promise<string[]> {
	return await storageService.repository.getProfiles();
}

export async function addProfile(profile: string): Promise<void> {
	const profiles = await getProfiles();
	if (profiles.includes(profile)) {
		throw new Error(`Profil "${profile}" existiert bereits.`);
	}
	profiles.push(profile);
	await storageService.repository.saveProfiles(profiles);
}

export async function deleteProfile(profileToDelete: string): Promise<void> {
	const profiles = await getProfiles();

	if (!profiles.includes(profileToDelete)) {
		throw new Error(`Profile "${profileToDelete}" does not exist.`);
	}
	if (profiles.length === 1) {
		throw new Error('Cannot delete the last remaining profile.');
	}

	await storageService.repository.deleteProfileData(profileToDelete);

	const updatedProfiles = (await getProfiles()).filter((p) => p !== profileToDelete);
	await storageService.repository.saveProfiles(updatedProfiles);

	// Handle active profile fallback.
	if ((await getActiveProfile()) === profileToDelete) {
		await setActiveProfile('default');
	}
}

export async function renameProfile(oldName: string, newName: string): Promise<void> {
	newName = newName.trim();
	if (!newName) {
		throw new Error('New profile name cannot be empty.');
	}
	if (oldName === newName) {
		return; // Nothing to do.
	}

	const profiles = await getProfiles();
	if (!profiles.includes(oldName)) {
		throw new Error(`Profile "${oldName}" does not exist.`);
	}
	if (profiles.includes(newName)) {
		throw new Error(`Profile "${newName}" already exists.`);
	}

	await storageService.repository.renameProfileData(oldName, newName);

	const updatedProfiles = (await getProfiles()).map((p) => (p === oldName ? newName : p));
	await storageService.repository.saveProfiles(updatedProfiles);

	if ((await getActiveProfile()) === oldName) {
		await setActiveProfile(newName);
	}
}
