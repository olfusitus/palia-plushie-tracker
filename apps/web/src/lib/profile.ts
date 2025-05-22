// import { type ResourceType, loadData, saveData } from './storage';
import { STORAGE_KEYS } from './storage'; // Stelle sicher, dass STORAGE_KEYS importiert ist

const PROFILE_KEY = 'palia_tracker_active_profile';
const PROFILES_KEY = 'palia_tracker_profiles';

export function getActiveProfile(): string {
	if (typeof localStorage === 'undefined') return 'default';
	const activeProfile = localStorage.getItem(PROFILE_KEY);
	return activeProfile || 'default';
}

export function setActiveProfile(profile: string): void {
	localStorage.setItem(PROFILE_KEY, profile);
}

export function getProfiles(): string[] {
	if (typeof localStorage === 'undefined') return [];
	const profiles = localStorage.getItem(PROFILES_KEY);
	return profiles ? JSON.parse(profiles) : ['default'];
}

export function addProfile(profile: string): void {
	const profiles = getProfiles();
	if (profiles.includes(profile)) {
		throw new Error(`Profil "${profile}" existiert bereits.`);
	}

	if (!profiles.includes(profile)) {
		profiles.push(profile);
		localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
	}
}

export function deleteProfile(profile: string): void {
	let profiles = getProfiles();
	profiles = profiles.filter((p) => p !== profile);
	localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));

	// Entferne alle gespeicherten Daten des Profils
	const resourceTypes = Object.keys(STORAGE_KEYS) as Array<keyof typeof STORAGE_KEYS>;
	resourceTypes.forEach((resourceType) => {
		const key = `${profile}_${STORAGE_KEYS[resourceType]}`;
		localStorage.removeItem(key);
	});

	// Fallback auf 'default', falls das aktive Profil gelöscht wird
	if (getActiveProfile() === profile) {
		setActiveProfile('default');
	}
	if (getProfiles().length === 0) {
		addProfile('default');
	}
}

export function renameProfile(oldName: string, newName: string): void {
	if (!newName.trim()) {
		throw new Error('Der neue Profilname darf nicht leer sein.');
	}

	const profiles = getProfiles();
	if (!profiles.includes(oldName)) {
		throw new Error(`Profil "${oldName}" existiert nicht.`);
	}
	if (profiles.includes(newName)) {
		throw new Error(`Profil "${newName}" existiert bereits.`);
	}

	const resourceTypes = Object.keys(STORAGE_KEYS) as Array<keyof typeof STORAGE_KEYS>;

	resourceTypes.forEach((resourceType) => {
		const oldKey = `${oldName}_${STORAGE_KEYS[resourceType]}`;
		const newKey = `${newName}_${STORAGE_KEYS[resourceType]}`;
		const data = localStorage.getItem(oldKey);
		console.log(`Renaming ${oldKey} to ${newKey}`);
		console.log(`Data: ${data}`);
		if (data) {
			localStorage.setItem(newKey, data);
			localStorage.removeItem(oldKey);
		}
	});

	// Aktualisiere die Profil-Liste
	const updatedProfiles = profiles.map((profile) => (profile === oldName ? newName : profile));
	localStorage.setItem('palia_tracker_profiles', JSON.stringify(updatedProfiles));

	// Falls das aktive Profil umbenannt wird, aktualisiere es
	if (getActiveProfile() === oldName) {
		setActiveProfile(newName);
	}
}
