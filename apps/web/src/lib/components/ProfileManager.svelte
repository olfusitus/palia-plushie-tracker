<script lang="ts">
	import {
		getProfiles,
		renameProfile,
		addProfile,
		deleteProfile,
		getActiveProfile,
		setActiveProfile
	} from '$lib/profile';

	import { downloadLocalStorage, importLocalStorage } from '$lib/storage';
	import { resourceStore } from '$lib/stores/resourceStore';
	import { toasts } from '$lib/stores/toastStore';

	let profiles = getProfiles();
	let newProfile = '';
	let activeProfile = getActiveProfile();
	let renameMode = false;
	let profileToRename = '';
	let newProfileName = '';

	function startRename(profile: string) {
		renameMode = true;
		profileToRename = profile;
		newProfileName = profile;
	}

	function confirmRename() {
		try {
			const oldActiveProfile = getActiveProfile();
			renameProfile(profileToRename, newProfileName.trim());
			if (oldActiveProfile === profileToRename) {
				resourceStore.reset();
			}
			profiles = getProfiles();
			activeProfile = getActiveProfile();
			renameMode = false;
			toasts.success(
				`Profil "${profileToRename}" erfolgreich in "${newProfileName.trim()}" umbenannt.`
			);
			profileToRename = '';
			newProfileName = '';
		} catch (error) {
			toasts.error(
				error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.'
			);
		}
	}

	function cancelRename() {
		renameMode = false;
		profileToRename = '';
		newProfileName = '';
	}

	function createProfile() {
		try {
			if (newProfile.trim()) {
				addProfile(newProfile.trim());
				profiles = getProfiles();
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

	function switchProfile(profile: string) {
		setActiveProfile(profile);
		resourceStore.reset();
		activeProfile = profile;
		toasts.info(`Aktives Profil zu "${profile}" gewechselt.`);
	}

	function confirmDelete(profile: string) {
		const confirmed = confirm(
			`Möchtest du das Profil "${profile}" wirklich löschen? Alle zugehörigen Daten gehen verloren!`
		);
		if (confirmed) {
			try {
				const wasActive = getActiveProfile() === profile;
				deleteProfile(profile);
				if (wasActive) {
					resourceStore.reset();
				}
				profiles = getProfiles();
				activeProfile = getActiveProfile();
				toasts.success(`Profil "${profile}" erfolgreich gelöscht.`);
			} catch (error) {
				toasts.error(error instanceof Error ? error.message : 'Fehler beim Löschen des Profils.');
			}
		}
	}

	let fileInput: HTMLInputElement;

	function handleImport() {
		const files = fileInput?.files;
		if (files && files.length > 0) {
			try {
				importLocalStorage(files[0]);
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
		{#each profiles as profile (profile)}
			<div
				class={`card border shadow-lg transition ${activeProfile === profile ? 'border-primary' : 'border-base-200'}`}
			>
				<div class="card-body flex flex-col gap-3 p-4">
					{#if renameMode && profileToRename === profile}
						<input type="text" bind:value={newProfileName} class="input input-bordered w-full" />
						<div class="flex justify-end gap-2">
							<button on:click={confirmRename} class="btn btn-success btn-sm">Speichern</button>
							<button on:click={cancelRename} class="btn btn-ghost btn-sm">Abbrechen</button>
						</div>
					{:else}
						<div class="flex items-center gap-2">
							<span
								class="flex-1 truncate text-lg font-semibold {activeProfile === profile
									? 'text-primary'
									: ''}">{profile}</span
							>
							{#if activeProfile === profile}
								<span class="badge badge-primary badge-outline">Aktiv</span>
							{/if}
						</div>
						<div class="flex flex-wrap justify-end gap-2">
							<button
								on:click={() => switchProfile(profile)}
								disabled={activeProfile === profile}
								class="btn btn-primary btn-sm {activeProfile === profile ? 'btn-disabled' : ''}"
								>{activeProfile === profile ? 'Aktiv' : 'Wechseln'}</button
							>
							<button on:click={() => startRename(profile)} class="btn btn-info btn-sm btn-outline"
								>Umbenennen</button
							>
							<button
								on:click={() => confirmDelete(profile)}
								class="btn btn-error btn-sm btn-outline">Löschen</button
							>
						</div>
					{/if}
				</div>
			</div>
		{/each}
		<!-- Neue Profil Card -->
		<div class="card bg-base-200 border-base-200 flex flex-col justify-center border shadow-lg">
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
					<button on:click={createProfile} class="btn btn-success">Erstellen</button>
				</div>
			</div>
		</div>
	</div>
	<h2 class="text-primary mb-2 text-center text-3xl font-extrabold">Daten verwalten</h2>
	<div class="card card-border bg-base-100 border-base-200 shadow-lg">
		<div class="card-body">
			<h2 class="card-title">Backup</h2>
			<!-- <label class="text-base-content/60 text-sm" for="lsDownBtn">Backup herunterladen: </label> -->
			<div class="card-actions justify-end">
				<p>
					Klicke den "Daten exportieren" Button um die im Browser gespeicherten Daten
					herunterzuladen.
				</p>
				<button class="btn btn-primary" id="lsDownBtn" on:click={downloadLocalStorage}
					>Daten exportieren (JSON)</button
				>
			</div>
			<p>
				Wähle eine Datei aus und klicke den "Daten importieren" Button um zuvor heruntergeladene
				Daten hochzuladen.
			</p>

			<div class="card-actions justify-end">
				<input type="file" class="file-input join-item" bind:this={fileInput} />
				<button class="btn btn-primary join-item" id="lsDownBtn" on:click={handleImport}
					>Daten importieren</button
				>
			</div>
		</div>
	</div>
</div>
