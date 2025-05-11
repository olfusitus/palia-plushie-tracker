<script lang="ts">
	import { onMount } from 'svelte';
	import type { Resource } from '$lib/storage';
	import { exportCSV } from '$lib/storage';

	export let resource: Resource;
	export let addEntry: (type: string, size: string, rareDrops: number) => void;

	let buttonStatus: Record<string, boolean> = {};
	let showRareDropMenu = false; // Steuert die Sichtbarkeit des Untermenüs
	let showMobileMenu = false; // Steuert die Sichtbarkeit des mobilen Menüs

	// Initialisiere den Button-Status für jede Größe
	onMount(() => {
		for (const size in resource.sizes) {
			buttonStatus[size] = false;
		}
	});

	function buttonClass(size: string): string {
		const base =
			'w-[45%] h-20 text-base sm:text-lg flex items-center justify-center rounded-lg shadow-md transition-all duration-200 ease-out active:scale-95 active:shadow-inner text-white';

		const activeClass = 'bg-green-600';

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

<div class="mb-8 flex w-full max-w-md flex-wrap justify-center gap-4">
	<div class="flex w-full items-center justify-center gap-4">
		<h2 class="text-xl font-semibold">{resource.name}</h2>
		<div class="relative sm:hidden">
			<button
				on:click={toggleMobileMenu}
				class="rounded-full bg-gray-500 p-2 text-white shadow-md transition-all duration-200 hover:bg-gray-400 active:scale-95"
				aria-label="Menü öffnen"
			>
				&#x22EE; <!-- Drei-Punkt-Symbol -->
			</button>
			{#if showMobileMenu}
				<div class="absolute right-0 z-50 mt-2 w-48 rounded-lg bg-white shadow-lg">
					<button
						on:click={downloadCSV}
						class="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
					>
						Daten exportieren (CSV)
					</button>
					<a
						href="/stats/{resource.type}"
						class="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
					>
						Statistik anzeigen
					</a>
					<a
						href="/manage/{resource.type}"
						class="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
					>
						Einträge bearbeiten
					</a>
				</div>
			{/if}
		</div>
	</div>

	<!-- Buttons für die verschiedenen Größen -->
	{#each Object.keys(resource.sizes) as size}
		<button
			on:click={() => handleClick(size, 0)}
			class={buttonClass(size)}
			disabled={buttonStatus[size]}
		>
			{#if buttonStatus[size]}Gespeichert ✓{:else}{resource.labels[size]}{/if}
		</button>
	{/each}

	<!-- Button für RareDrop mit Untermenü -->
	<div class="relative w-[45%]">
		<button
			on:click={toggleRareDropMenu}
			class="flex h-20 w-full items-center justify-center rounded-lg bg-purple-500 text-base text-white shadow-md transition-all duration-200 hover:bg-purple-400 active:scale-95 sm:text-lg"
		>
			RareDrop
		</button>
		{#if showRareDropMenu}
			<div class="absolute left-0 z-40 mt-2 w-48 rounded-lg bg-white shadow-lg">
				{#each Object.keys(resource.sizes) as size}
					<button
						on:click={() => handleRareDrop(size)}
						class="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
					>
						{resource.labels[size]}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<div class="mt-8 hidden flex-col items-center gap-4 text-center sm:flex">
	<button
		on:click={downloadCSV}
		class="rounded-lg bg-emerald-500 px-6 py-3 text-white shadow-md transition-all duration-200 hover:bg-emerald-400 active:scale-95"
	>
		Daten exportieren (CSV)
	</button>
	<a
		href="/huntingStats/{resource.type}"
		class="text-blue-700 underline transition-colors duration-200 hover:text-blue-900"
		>Statistik anzeigen</a
	>
	<a
		href="/manage/{resource.type}"
		class="text-blue-700 underline transition-colors duration-200 hover:text-blue-900"
		>Einträge bearbeiten</a
	>
</div>
