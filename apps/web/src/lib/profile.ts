import { storageService } from '$lib/storage/index';

export function getActiveProfile(): string {
	return storageService.repository.getActiveProfileName();
}

export function setActiveProfile(profile: string): void {
	storageService.repository.setActiveProfileName(profile);
}

export function getProfiles(): string[] {
	return storageService.repository.getProfiles();
}

export function addProfile(profile: string): void {
	const profiles = getProfiles();
	if (profiles.includes(profile)) {
		throw new Error(`Profil "${profile}" existiert bereits.`);
	}
	profiles.push(profile);
	storageService.repository.saveProfiles(profiles);
}

export function deleteProfile(profileToDelete: string): void {
	const profiles = getProfiles();

	if (!profiles.includes(profileToDelete)) {
		throw new Error(`Profile "${profileToDelete}" does not exist.`);
	}
	if (profiles.length === 1) {
		throw new Error('Cannot delete the last remaining profile.');
	}

	storageService.repository.deleteProfileData(profileToDelete);

	const updatedProfiles = getProfiles().filter((p) => p !== profileToDelete);
	storageService.repository.saveProfiles(updatedProfiles);

	// Handle active profile fallback.
	if (getActiveProfile() === profileToDelete) {
		setActiveProfile('default');
	}
}

export function renameProfile(oldName: string, newName: string): void {
	newName = newName.trim();
	if (!newName) {
		throw new Error('New profile name cannot be empty.');
	}
	if (oldName === newName) {
		return; // Nothing to do.
	}

	const profiles = getProfiles();
	if (!profiles.includes(oldName)) {
		throw new Error(`Profile "${oldName}" does not exist.`);
	}
	if (profiles.includes(newName)) {
		throw new Error(`Profile "${newName}" already exists.`);
	}

	storageService.repository.renameProfileData(oldName, newName);

	const updatedProfiles = getProfiles().map((p) => (p === oldName ? newName : p));
	storageService.repository.saveProfiles(updatedProfiles);

	if (getActiveProfile() === oldName) {
		setActiveProfile(newName);
	}
}
