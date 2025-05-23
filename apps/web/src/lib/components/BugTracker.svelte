<script lang="ts">
	import { onMount } from 'svelte';
	import type { Resource } from '$lib/storage';
	import { exportCSV } from '$lib/storage';

	export let resource: Resource;
	export let addEntry: (type: string, rareDrops: number) => void;

	let buttonStatus: boolean = false;
	let showRareDropMenu = false; // Steuert die Sichtbarkeit des Untermenüs
	let showMobileMenu = false; // Steuert die Sichtbarkeit des mobilen Menüs

	// Initialisiere den Button-Status für jede Größe
	onMount(() => {
		// for (const size in resource.sizes) {
		// 	buttonStatus[size] = false;
		// }
	});

	function buttonClass(): string {
		const base =
			'btn w-[45%] h-20 sm:text-lg flex items-center justify-center rounded-lg shadow-md transition-all duration-200 ease-out active:scale-95 active:shadow-inner text-white';

		const activeClass = 'bg-green-600!';

		const colorByType = 'bg-amber-400';

		const hoverColors = 'hover:bg-amber-300';

		const active = buttonStatus;
		return active ? `${base} ${activeClass}` : `${base} ${colorByType} ${hoverColors}`;
	}

	function handleClick(rareDrops: number) {
		addEntry(resource.type, rareDrops);
		buttonStatus = true;
		setTimeout(() => {
			buttonStatus = false;
		}, 500);
	}

	function toggleRareDropMenu() {
		showRareDropMenu = !showRareDropMenu;
	}

	function toggleMobileMenu() {
		showMobileMenu = !showMobileMenu;
	}

	function handleRareDrop() {
		handleClick(1); // Fügt einen RareDrop hinzu
		showRareDropMenu = false; // Schließt das Untermenü
	}

	function downloadCSV() {
		const csv = exportCSV(resource.type);
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `${resource.type}_data.csv`;
		link.click();
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
					<li><button on:click={downloadCSV}>Daten exportieren (CSV)</button></li>
					<li><a href={`/huntingStats/${resource.type}`}>Statistik anzeigen</a></li>
					<li><a href={`/manage/${resource.type}`}>Einträge bearbeiten</a></li>
				</ul>
			</div>
		</div>

		<!-- Buttons für die verschiedenen Größen -->
		<div class="flex w-full flex-wrap justify-center gap-4">

				<button
					on:click={() => handleClick(0)}
					class="btn btn-soft btn-primary w-[45%] h-20 rounded-lg"

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
			<button on:click={downloadCSV} class="btn btn-outline btn-success w-48">
				Daten exportieren (CSV)
			</button>
			<a href={`/huntingStats/${resource.type}`} class="btn btn-link">Statistik anzeigen</a>
			<a href={`/manage/${resource.type}`} class="btn btn-link">Einträge bearbeiten</a>
		</div>
	</div>
</div>
