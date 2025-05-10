<script lang="ts">
	import { addEntry, exportCSV } from '$lib/storage';
	import type { OreSize } from '$lib/storage';

	// type OreSize = 'small' | 'medium' | 'large';

	const goldSettings: Record<OreSize, number[]> = {
		small: [0, 1],
		medium: [0, 1, 2],
		large: [0, 1, 2, 3]
	};

	const labels: Record<OreSize, string> = {
		small: 'S',
		medium: 'M',
		large: 'L'
	};

	const buttonStatus: Record<string, Record<number, boolean>> = {
		small: {},
		medium: {},
		large: {}
	};

	for (const typ in goldSettings) {
		for (const g of goldSettings[typ as OreSize]) {
			buttonStatus[typ][g] = false;
		}
	}

	function buttonClass(type: string, gold: number): string {
		// const base = 'px-4 py-2 rounded w-[48%] transition-all duration-300';
		const base =
			'w-[45%] h-20 text-lg flex items-center justify-center rounded transition-all duration-300';

		const active = buttonStatus[type][gold];
		return active
			? `${base} bg-green-600 text-white`
			: `${base} bg-blue-500 text-white hover:bg-blue-600`;
	}

	function handleClick(type: OreSize, gold: number) {
		addEntry(type, gold);
		buttonStatus[type][gold] = true;
		setTimeout(() => {
			buttonStatus[type][gold] = false;
		}, 500);
	}

	function getLabel(type: OreSize, gold: number) {
		return gold === 0 ? labels[type] : `${labels[type]}+${gold}G`;
	}

	function downloadCSV() {
		const csv = exportCSV();
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'erz_daten.csv';
		link.click();
	}
</script>

<!-- <video
	src="/bg.mp4"
	autoplay
	loop
	muted
	playsinline
	class="fixed top-0 left-0 w-full h-full object-cover z-[-1] blur-sm opacity-60"
></video> -->

<div class="flex h-screen flex-col items-center justify-start px-4 py-8">
<h1 class="mb-6 text-center text-2xl font-bold">Erz-Drop Tracker</h1>
	<div class="w-full max-w-md space-y-8">
		<!-- S -->
		<div class="mb-8 flex w-full max-w-md flex-wrap justify-center gap-4">
			{#each [0, 1] as g}
				<button
					on:click={() => handleClick('small', g)}
					class={buttonClass('small', g)}
					disabled={buttonStatus.small[g]}
				>
					{#if buttonStatus.small[g]}Gespeichert ✓{:else}{getLabel('small', g)}{/if}
				</button>
			{/each}
		</div>

		<!-- M -->
		<div class="mb-8 flex w-full max-w-md flex-wrap justify-center gap-4">
			{#each [0, 1, 2] as g}
				<button
					on:click={() => handleClick('medium', g)}
					class={buttonClass('medium', g)}
					disabled={buttonStatus.medium[g]}
				>
					{#if buttonStatus.medium[g]}Gespeichert ✓{:else}{getLabel('medium', g)}{/if}
				</button>
			{/each}
		</div>

		<!-- L -->
		<div class="mb-8 flex w-full max-w-md flex-wrap justify-center gap-4">
			{#each [0, 1, 2, 3] as g}
				<button
					on:click={() => handleClick('large', g)}
					class={buttonClass('large', g)}
					disabled={buttonStatus.large[g]}
				>
					{#if buttonStatus.large[g]}Gespeichert ✓{:else}{getLabel('large', g)}{/if}
				</button>
			{/each}
		</div>

		<div class="mt-8 flex flex-col items-center gap-4 text-center">
			<button
				on:click={downloadCSV}
				class="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
			>
				Daten exportieren (CSV)
			</button>
			<a href="/stats" class="text-blue-700 underline">Statistik anzeigen</a>
			<a href="/manage" class="text-blue-700 underline">Einträge bearbeiten</a>
		</div>
	</div>
</div>
