<script lang="ts">
	// import { onMount } from 'svelte';
	import type { BugResource } from '$lib/storage';
	import { resourceStore } from '$lib/stores/resourceStore';
	import { exportResourceAsCSV, downloadFile } from '$lib/utils/exporter';

	export let resource: BugResource;

	let buttonStatus: boolean = false;

	function handleClick(plushie: boolean) {
		resourceStore.addEntry(resource.type, plushie);
		buttonStatus = true;
		setTimeout(() => {
			buttonStatus = false;
		}, 500);
	}

	function handleRareDrop() {
		handleClick(true); // Fügt einen RareDrop hinzu
	}

	function handleDownloadCSV() {
		const csv = exportResourceAsCSV(resource.type);
		downloadFile(csv, `${resource.type}_data.csv`);
	}
</script>

<div class="card bg-base-100 border-base-300 mb-8 w-full border shadow-xl">
	<div class="card-body w-full px-4">
		<div class="mb-4 flex w-full items-center gap-4">
			<h2 class="card-title">{resource.name}</h2>
			<div class="dropdown dropdown-end ml-auto sm:hidden">
				<button tabindex="0" class="btn btn-ghost btn-circle" aria-label="Menü öffnen">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<circle cx="12" cy="5" r="1.5" />
						<circle cx="12" cy="12" r="1.5" />
						<circle cx="12" cy="19" r="1.5" />
					</svg>
				</button>
				<ul
					class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
				>
					<li><button on:click={handleDownloadCSV}>Daten exportieren (CSV)</button></li>
					<li><a href={`/bugStats/${resource.type}`}>Statistik anzeigen</a></li>
					<li><a href={`/manage/${resource.type}`}>Einträge bearbeiten</a></li>
				</ul>
			</div>
		</div>

		<!-- Buttons für die verschiedenen Größen -->
		<div class="flex w-full flex-wrap justify-center gap-4">
			<button
				on:click={() => handleClick(false)}
				class="btn btn-soft btn-primary flex h-20 w-[45%] rounded-lg"
				disabled={buttonStatus}
			>
				{#if buttonStatus}Gespeichert ✓{:else}{resource.name}{/if}
			</button>

			<!-- Button für RareDrop mit Untermenü -->
			<div class="relative w-[45%]">
				<button
					on:click={() => handleRareDrop()}
					class="btn btn-soft btn-secondary flex h-20 w-full items-center justify-center rounded-lg shadow-md transition-all duration-200 hover:bg-purple-400 active:scale-95 sm:text-lg"
				>
					Plüschi
				</button>
			</div>
		</div>

		<!-- <div class="divider my-2 hidden sm:block">Aktionen</div> -->
		<div class="mt-2 hidden flex-col items-center gap-2 sm:flex">
			<button on:click={handleDownloadCSV} class="btn btn-outline btn-success w-48">
				Daten exportieren (CSV)
			</button>
			<a href={`/bugStats/${resource.type}`} class="btn btn-link">Statistik anzeigen</a>
			<a href={`/manage/${resource.type}`} class="btn btn-link">Einträge bearbeiten</a>
		</div>
	</div>
</div>
