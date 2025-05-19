<script lang="ts">
	import {
		getProfiles,
		renameProfile,
		addProfile,
		deleteProfile,
		getActiveProfile,
		setActiveProfile
	} from '$lib/profile';
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
			renameProfile(profileToRename, newProfileName.trim());
			profiles = getProfiles();
			activeProfile = getActiveProfile();
			renameMode = false;
			profileToRename = '';
			newProfileName = '';
		} catch (error) {
			alert(error instanceof Error ? error.message : 'An unknown error occurred');
		}
	}

	function cancelRename() {
		renameMode = false;
		profileToRename = '';
		newProfileName = '';
	}

	function createProfile() {
		if (newProfile.trim()) {
			addProfile(newProfile.trim());
			profiles = getProfiles();
			newProfile = '';
		}
	}

	function switchProfile(profile: string) {
		setActiveProfile(profile);
		activeProfile = profile;
	}

	function confirmDelete(profile: string) {
		const confirmed = confirm(`Möchtest du das Profil "${profile}" wirklich löschen?`);
		if (confirmed) {
			deleteProfile(profile);
			profiles = getProfiles();
			activeProfile = getActiveProfile();
		}
	}
</script>

<div class="max-w-lg w-full mx-auto p-6 bg-base-200 rounded-box shadow space-y-6">
	<h2 class="text-2xl font-bold text-primary mb-2">Profile</h2>
	<ul class="space-y-4">
		{#each profiles as profile}
			<li class="flex flex-wrap items-center justify-between gap-2 rounded-lg hover:bg-base-300 transition p-3">
				{#if renameMode && profileToRename === profile}
					<div class="flex-1">
						<input
							type="text"
							bind:value={newProfileName}
							class="input input-bordered w-full"
						/>
					</div>
					<div class="flex gap-2">
						<button
							on:click={confirmRename}
							class="btn btn-success btn-sm"
						>Speichern</button>
						<button
							on:click={cancelRename}
							class="btn btn-ghost btn-sm"
						>Abbrechen</button>
					</div>
				{:else}
					<span class="flex-1 text-base-content font-medium">{profile}</span>
					<div class="flex flex-wrap justify-end gap-2">
						<button
							on:click={() => confirmDelete(profile)}
							class="btn btn-warning btn-sm btn-outline"
						>Löschen</button>
						<button
							on:click={() => startRename(profile)}
							class="btn btn-info btn-sm btn-outline"
						>Umbenennen</button>
						<button
							on:click={() => switchProfile(profile)}
							disabled={activeProfile === profile}
							class={`btn btn-primary btn-sm ${activeProfile === profile ? 'btn-disabled' : ''}`}
						>
							{activeProfile === profile ? 'Aktiv' : 'Wechseln'}
						</button>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
	<div class="flex items-center gap-2">
		<input
			type="text"
			bind:value={newProfile}
			placeholder="Neues Profil"
			class="input input-bordered flex-1"
		/>
		<button
			on:click={createProfile}
			class="btn btn-success"
		>Erstellen</button>
	</div>
</div>
