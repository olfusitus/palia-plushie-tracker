<script lang="ts">
	// fixme: When deleting the active profile and now "default" exists, there is no active profile anymore.
	import {
		getProfiles,
		renameProfile,
		addProfile,
		deleteProfile,
		getActiveProfile,
		setActiveProfile
	} from '$lib/profile';

	import { downloadStorage, importStorage } from '$lib/storage';
	import { resourceStore } from '$lib/stores/resourceStore';
	import { toasts } from '$lib/stores/toastStore';
	import type { Profile } from '$lib/storage/types';

	let profiles: Profile[] = [];
	let newProfile = '';
	let activeProfile: Profile | null = null;
	let renameMode = false;
	let profileToRename: Profile | null = null;
	let newProfileName = '';

	async function loadProfilesAndActive() {
		profiles = await getProfiles();
		activeProfile = await getActiveProfile();
	}

	loadProfilesAndActive();

	function startRename(profile: Profile) {
		renameMode = true;
		profileToRename = profile;
		newProfileName = profile.name;
	}

	async function confirmRename() {
		if (!profileToRename) return;

		try {
			const oldActiveProfile = await getActiveProfile();
			await renameProfile(profileToRename.id, newProfileName.trim());
			if (oldActiveProfile?.id === profileToRename.id) {
				resourceStore.reset();
			}
			await loadProfilesAndActive();
			renameMode = false;
			toasts.success(
				`Profil "${profileToRename.name}" erfolgreich in "${newProfileName.trim()}" umbenannt.`
			);
			profileToRename = null;
			newProfileName = '';
		} catch (error) {
			toasts.error(
				error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.'
			);
		}
	}

	function cancelRename() {
		renameMode = false;
		profileToRename = null;
		newProfileName = '';
	}

	async function createProfile() {
		try {
			if (newProfile.trim()) {
				await addProfile(newProfile.trim());
				await loadProfilesAndActive();
				toasts.success(`Profil "${newProfile.trim()}" erfolgreich erstellt.`);
				newProfile = '';
			} else {
				toasts.warning('Profilname darf nicht leer sein.');
			}
		} catch (error) {
			toasts.error(
				error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.'
			);
		}
	}

	async function switchProfile(profile: Profile) {
		await setActiveProfile(profile);
		resourceStore.reset();
		activeProfile = profile;
		toasts.info(`Aktives Profil zu "${profile.name}" gewechselt.`);
	}

	async function confirmDelete(profile: Profile) {
		const confirmed = confirm(
			`Möchtest du das Profil "${profile.name}" wirklich löschen? Alle zugehörigen Daten gehen verloren!`
		);
		if (confirmed) {
			try {
				const wasActive = activeProfile?.id === profile.id;
				await deleteProfile(profile.id);
				if (wasActive) {
					resourceStore.reset();
				}
				await loadProfilesAndActive();
				toasts.success(`Profil "${profile.name}" erfolgreich gelöscht.`);
			} catch (error) {
				toasts.error(error instanceof Error ? error.message : 'Fehler beim Löschen des Profils.');
			}
		}
	}

	let fileInput: HTMLInputElement;

	async function handleImport() {
		const files = fileInput?.files;
		if (files && files.length > 0) {
			try {
				toasts.info('Import läuft... Bitte warten.', 10000); // Longer duration for loading
				await importStorage(files[0]);
				resourceStore.reset();
				toasts.success('Import abgeschlossen! Die Seite wird neu geladen.');
				// Delay to allow the user to see the success message
				setTimeout(() => {
					location.reload();
				}, 1500);
			} catch (error) {
				toasts.error(error instanceof Error ? error.message : 'Fehler beim importieren der Datei.');
				console.error('Import error:', error);
				return;
			}
		} else {
			toasts.warning('Bitte zuerst eine Datei auswählen.');
		}
	}
</script>

<div class="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
	<h2 class="text-primary mb-2 text-center text-3xl font-extrabold">Profile verwalten</h2>
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
		{#each profiles as profile (profile.id)}
			<div
				class={`card bg-base-100 border shadow-lg transition ${activeProfile?.id === profile.id ? 'border-primary' : 'border-base-300'}`}
			>
				<div class="card-body flex flex-col gap-3 p-4">
					{#if renameMode && profileToRename?.id === profile.id}
						<input type="text" bind:value={newProfileName} class="input input-bordered w-full" />
						<div class="flex justify-end gap-2">
							<button onclick={confirmRename} class="btn btn-success btn-sm">Speichern</button>
							<button onclick={cancelRename} class="btn btn-ghost btn-sm">Abbrechen</button>
						</div>
					{:else}
						<div class="flex items-center gap-2">
							<span
								class="flex-1 truncate text-lg font-semibold {activeProfile?.id === profile.id
									? 'text-primary'
									: ''}">{profile.name}</span
							>
							{#if activeProfile?.id === profile.id}
								<span class="badge badge-primary badge-outline">Aktiv</span>
							{/if}
						</div>
						<div class="flex flex-wrap justify-end gap-2">
							<button
								onclick={() => switchProfile(profile)}
								disabled={activeProfile?.id === profile.id}
								class="btn btn-primary btn-sm {activeProfile?.id === profile.id
									? 'btn-disabled'
									: ''}">{activeProfile?.id === profile.id ? 'Aktiv' : 'Wechseln'}</button
							>
							<button onclick={() => startRename(profile)} class="btn btn-info btn-sm btn-outline"
								>Umbenennen</button
							>
							<button
								onclick={() => confirmDelete(profile)}
								class="btn btn-error btn-sm btn-outline">Löschen</button
							>
						</div>
					{/if}
				</div>
			</div>
		{/each}
		<!-- Neue Profil Card -->
		<div class="card bg-base-200 border-base-300 flex flex-col justify-center border shadow-lg">
			<div class="card-body flex flex-col gap-3 p-4">
				<label for="new-profile-input" class="label text-base font-semibold"
					>Neues Profil anlegen</label
				>
				<div class="flex gap-2">
					<input
						id="new-profile-input"
						type="text"
						bind:value={newProfile}
						placeholder="Profilname"
						class="input input-bordered flex-1"
					/>
					<button onclick={createProfile} class="btn btn-success">Erstellen</button>
				</div>
			</div>
		</div>
	</div>
	<h2 class="text-primary mb-2 text-center text-3xl font-extrabold">Daten verwalten</h2>
	<div class="card card-border bg-base-100 border-base-300 shadow-lg">
		<div class="card-body">
			<h2 class="card-title">Backup</h2>
			<!-- <label class="text-base-content/60 text-sm" for="lsDownBtn">Backup herunterladen: </label> -->
			<div class="card-actions justify-end">
				<p>
					Klicke den "Daten exportieren" Button um die im Browser gespeicherten Daten
					herunterzuladen.
				</p>
				<button class="btn btn-primary" id="lsDownBtn" onclick={downloadStorage}
					>Daten exportieren (JSON)</button
				>
			</div>
			<p>
				Wähle eine Datei aus und klicke den "Daten importieren" Button um zuvor heruntergeladene
				Daten hochzuladen.
			</p>

			<div class="card-actions justify-end">
				<input type="file" class="file-input join-item" bind:this={fileInput} />
				<button class="btn btn-primary join-item" id="lsDownBtn" onclick={handleImport}
					>Daten importieren</button
				>
			</div>
		</div>
	</div>
</div>
