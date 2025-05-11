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

<div class="mx-auto w-full max-w-sm space-y-6 rounded-xl bg-white p-6 shadow-md">
	<h2 class="text-2xl font-bold text-gray-800">Profile</h2>
	<ul class="space-y-4">
		{#each profiles as profile}
			<li class="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-100 p-3">
				{#if renameMode && profileToRename === profile}
					<div class="flex-1">
						<input
							type="text"
							bind:value={newProfileName}
							class="w-full rounded border border-gray-300 px-2 py-1"
						/>
					</div>
					<div class="flex gap-2">
						<button
							on:click={confirmRename}
							class="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600">Speichern</button
						>
						<button
							on:click={cancelRename}
							class="rounded bg-gray-400 px-3 py-1 text-white hover:bg-gray-500">Abbrechen</button
						>
					</div>
				{:else}
					<span class="flex-1 text-gray-700">{profile}</span>
					<div class="flex flex-wrap justify-end gap-2">
						<button
							on:click={() => confirmDelete(profile)}
							class="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600">Löschen</button
						>
						<button
							on:click={() => startRename(profile)}
							class="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
							>Umbenennen</button
						>
						<button
							on:click={() => switchProfile(profile)}
							disabled={activeProfile === profile}
							class={`${
								activeProfile === profile
									? 'cursor-not-allowed bg-blue-300'
									: 'bg-blue-500 hover:bg-blue-600'
							} rounded px-3 py-1 text-white`}
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
			class="flex-1 rounded border border-gray-300 px-3 py-2"
		/>
		<button
			on:click={createProfile}
			class="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
		>
			Erstellen
		</button>
	</div>
</div>
