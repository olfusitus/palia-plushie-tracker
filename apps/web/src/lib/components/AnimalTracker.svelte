<script lang="ts">
	import { onMount } from 'svelte';
	import type { AnimalResource, Resource, ResourceSize } from '$lib/storage';
	import { downloadCSV, exportCSV } from '$lib/storage';

	export let resource: AnimalResource;
	export let addEntry: (type: string, size: string, rareDrops: number) => void;

	let buttonStatus: Record<string, boolean> = {};
	let showRareDropMenu = false; // Steuert die Sichtbarkeit des Untermenüs
	let showMobileMenu = false; // Steuert die Sichtbarkeit des mobilen Menüs

	// Initialisiere den Button-Status für jede Größe
	onMount(() => {
		for (const size in resource.availableSizes) {
			buttonStatus[size] = false;
		}
	});

	function buttonClass(size: string): string {
		const base =
			'btn w-[45%] h-20 sm:text-lg flex items-center justify-center rounded-lg shadow-md transition-all duration-200 ease-out active:scale-95 active:shadow-inner text-white';

		const activeClass = 'bg-green-600!';

		const colorByType: Record<string, string> = {
			small: 'bg-amber-400',
			medium: 'bg-orange-400',
			large: 'bg-rose-400'
		};

		const hoverColors: Record<string, string> = {
			small: 'hover:bg-amber-300',
			medium: 'hover:bg-orange-300',
			large: 'hover:bg-rose-300'
		};

		const active = buttonStatus[size];
		return active ? `${base} ${activeClass}` : `${base} ${colorByType[size]} ${hoverColors[size]}`;
	}

	function handleClick(size: string, rareDrops: number) {
		addEntry(resource.type, size, rareDrops);
		buttonStatus[size] = true;
		setTimeout(() => {
			buttonStatus[size] = false;
		}, 500);
	}

	function toggleRareDropMenu() {
		showRareDropMenu = !showRareDropMenu;
	}

	function toggleMobileMenu() {
		showMobileMenu = !showMobileMenu;
	}

	function handleRareDrop(size: string) {
		handleClick(size, 1); // Fügt einen RareDrop hinzu
		showRareDropMenu = false; // Schließt das Untermenü
	}

	function handleDownloadCSV() {
		const csv = exportCSV(resource.type);
		downloadCSV(csv, `${resource.type}_data.csv`);
	}
</script>

<div class="card bg-base-100 border-base-200 mb-8 w-full max-w-md border shadow-xl">
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
					<li><a href={`/huntingStats/${resource.type}`}>Statistik anzeigen</a></li>
					<li><a href={`/manage/${resource.type}`}>Einträge bearbeiten</a></li>
				</ul>
			</div>
		</div>

		<!-- Buttons für die verschiedenen Größen -->
		<div class="flex w-full flex-wrap justify-center gap-4">
			{#each resource.availableSizes as size}
				<button
					on:click={() => handleClick(size, 0)}
					class={buttonClass(size)}
					disabled={buttonStatus[size]}
				>
					{#if buttonStatus[size]}Gespeichert ✓{:else}{resource.labels[size as ResourceSize]}{/if}
				</button>
			{/each}

			<!-- Button für RareDrop mit Untermenü -->
			<div class="relative w-[45%]">
				<button
					on:click={toggleRareDropMenu}
					class="flex h-20 w-full items-center justify-center rounded-lg bg-purple-500 text-base text-white shadow-md transition-all duration-200 hover:bg-purple-400 active:scale-95 sm:text-lg"
				>
					Plüschi
				</button>
				{#if showRareDropMenu}
					<div class="absolute left-0 z-40 mt-2 w-48 rounded-lg bg-white shadow-lg">
						{#each resource.availableSizes as size}
							<button
								on:click={() => handleRareDrop(size)}
								class="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
							>
								{resource.labels[size as ResourceSize]}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- <div class="divider my-2 hidden sm:block">Aktionen</div> -->
		<div class="mt-2 hidden flex-col items-center gap-2 sm:flex">
			<button on:click={handleDownloadCSV} class="btn btn-outline btn-success w-48">
				Daten exportieren (CSV)
			</button>
			<a href={`/huntingStats/${resource.type}`} class="btn btn-link">Statistik anzeigen</a>
			<a href={`/manage/${resource.type}`} class="btn btn-link">Einträge bearbeiten</a>
		</div>
	</div>
</div>
