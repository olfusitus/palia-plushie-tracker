<script lang="ts">
	import { onMount } from 'svelte';
	import type { Resource } from '$lib/storage';
	import { exportCSV } from '$lib/storage';

	export let resource: Resource;
	export let addEntry: (type: string, size: string, value: number) => void;

	let buttonStatus: Record<string, Record<number, boolean>> = {};

	for (const size in resource.sizes) {
		buttonStatus[size] = {};
		for (const g of resource.sizes[size]) {
			buttonStatus[size][g] = false;
		}
	}

	function buttonClass(size: string, gold: number): string {
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

		const active = buttonStatus[size][gold];
		return active ? `${base} ${activeClass}` : `${base} ${colorByType[size]} ${hoverColors[size]}`;
	}

	function handleClick(size: string, gold: number) {
		addEntry(resource.type, size, gold);
		buttonStatus[size][gold] = true;
		setTimeout(() => {
			buttonStatus[size][gold] = false;
		}, 500);
	}

	function getLabel(size: string, gold: number) {
		return gold === 0 ? resource.labels[size] : `${resource.labels[size]}+${gold}G`;
	}

	function downloadCSV() {
		const csv = exportCSV(resource.type);
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'erz_daten.csv';
		link.click();
	}
</script>

<div class="mb-8 flex w-full max-w-md flex-wrap justify-center gap-4">
	{#each Object.keys(resource.sizes) as size}
		<div class="mb-8 flex w-full max-w-md flex-wrap justify-center gap-4">
			{#each resource.sizes[size] as gold}
				<button
					on:click={() => handleClick(size, gold)}
					class={buttonClass(size, gold)}
					disabled={buttonStatus[size][gold]}
				>
					{#if buttonStatus[size][gold]}Gespeichert ✓{:else}{getLabel(size, gold)}{/if}
				</button>
			{/each}
		</div>
	{/each}
	<div class="mt-8 flex flex-col items-center gap-4 text-center">
		<button
			on:click={downloadCSV}
			class="rounded-lg bg-emerald-500 px-6 py-3 text-white shadow-md transition-all duration-200 hover:bg-emerald-400 active:scale-95"
		>
			Daten exportieren (CSV)
		</button>
		<a
			href="/stats/{resource.type}"
			class="text-blue-700 underline transition-colors duration-200 hover:text-blue-900"
			>Statistik anzeigen</a
		>
		<a
			href="/manage/{resource.type}"
			class="text-blue-700 underline transition-colors duration-200 hover:text-blue-900"
			>Einträge bearbeiten</a
		>
	</div>
</div>
