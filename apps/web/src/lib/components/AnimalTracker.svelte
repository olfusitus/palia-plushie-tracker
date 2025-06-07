<script lang="ts">
	import { onMount } from 'svelte';
	import type { AnimalResource } from '$lib/storage';
	import type { ResourceSize } from '$lib/storage/types';
	import { resourceStore } from '$lib/stores/resourceStore';
	import { exportResourceAsCSV, downloadFile } from '$lib/utils/exporter';
	export let resource: AnimalResource;

	let buttonStatus: Record<string, boolean> = {};

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

	function handleClick(size: string, plushie: boolean) {
		console.log('handleClick', resource.type, size, plushie);
		resourceStore.addAnimalEntry(resource.type, size as ResourceSize, plushie);
		buttonStatus[size] = true;
		setTimeout(() => {
			buttonStatus[size] = false;
		}, 500);
	}

	function handleRareDrop(size: string) {
		handleClick(size, true); // Fügt einen RareDrop hinzu
	}

	function handleDownloadCSV() {
		const csv = exportResourceAsCSV(resource.type);
		downloadFile(csv, `${resource.type}_data.csv`);
	}
</script>

<div class="card bg-base-100 border-base-300 mb-8 w-full max-w-md border shadow-xl">
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
			{#each resource.availableSizes as size (size)}
				<button
					on:click={() => handleClick(size, false)}
					class={buttonClass(size)}
					disabled={buttonStatus[size]}
				>
					{#if buttonStatus[size]}Gespeichert ✓{:else}{resource.labels[size as ResourceSize]}{/if}
				</button>
			{/each}
			<div class="dropdown w-[45%]">
				<button
					tabindex="0"
					class="flex h-20 w-full items-center justify-center rounded-lg bg-purple-500 text-base text-white shadow-md transition-all duration-200 hover:bg-purple-400 active:scale-95 sm:text-lg"
				>
					Plüschi
				</button>
				<ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-sm">
					{#each resource.availableSizes as size (size)}
						<li>
							<button on:click={() => handleRareDrop(size)}
								>{resource.labels[size as ResourceSize]}</button
							>
						</li>
					{/each}
				</ul>
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
