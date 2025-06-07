<script lang="ts">
	import { onMount } from 'svelte';
	import type { BugResource, Resource } from '$lib/storage';
	// import { exportCSV } from '$lib/storage';
	import { resourceStore } from '$lib/stores/resourceStore';

	export let resources: BugResource[]; // Array statt einzelner Resource

	let buttonStatus: Record<string, boolean> = {};
	let showRareDropMenu = false;
	// let showMobileMenu = false;

	let rareDropMenuDirection: 'down' | 'up' = 'down';
	let plushieButtonRef: HTMLButtonElement | null = null;

	// Initialisiere den Button-Status für jede Resource
	onMount(() => {
		for (const resource of resources) {
			// const size = Object.keys(resource.sizes)[0];
			buttonStatus[resource.type] = false;
		}
	});

	function buttonClass(resourceType: string): string {
		// DaisyUI Button-Basis
		const base =
			'btn w-[45%] h-20 sm:text-lg flex items-center justify-center rounded-lg shadow-md transition-all duration-200 ease-out active:scale-95 active:shadow-inner text-white';

		const activeClass = 'bg-green-600!';

		// Farben nach resourceType
		const colorByType: Record<string, string> = {
			bug_rtb: 'btn-primary',
			bug_ladybug: 'btn-secondary',
			bug_snail: 'btn-accent',
			bug_lunar_fairy_moth: 'btn-info',
			bug_proudhorn_beetle: 'btn-warning',
			bug_lanternbug: 'btn-error',
			// fallback
			default: 'btn-neutral'
		};

		const color = colorByType[resourceType] || colorByType['default'];
		const active = buttonStatus[resourceType];
		return active ? `${base} ${activeClass}` : `${base} ${color}`;
	}

	function handleClick(resource: Resource, plushie: boolean) {
		resourceStore.addEntry(resource.type, plushie);
		buttonStatus[resource.type] = true;
		setTimeout(() => {
			buttonStatus[resource.type] = false;
		}, 500);
	}

	function toggleRareDropMenu() {
		showRareDropMenu = !showRareDropMenu;
		if (showRareDropMenu && plushieButtonRef) {
			// Timeout, damit das Element im DOM ist
			setTimeout(() => {
				const rect = plushieButtonRef!.getBoundingClientRect();
				const spaceBelow = window.innerHeight - rect.bottom;
				const menuHeight = 48 * resources.length; // 48px pro Button, ggf. anpassen
				rareDropMenuDirection = spaceBelow < menuHeight ? 'up' : 'down';
			}, 0);
		}
	}

	function handleRareDrop(resource: Resource) {
		handleClick(resource, true);
		showRareDropMenu = false;
	}

	// function downloadCSV(resource: Resource) {
	// 	const csv = exportCSV(resource.type);
	// 	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
	// 	const url = URL.createObjectURL(blob);
	// 	const link = document.createElement('a');
	// 	link.href = url;
	// 	link.download = `${resource.type}_data.csv`;
	// 	link.click();
	// }
</script>

<div class="card bg-base-100 border-base-300 mb-8 w-full max-w-md border shadow-xl">
	<div class="card-body w-full px-4">
		<div class="mb-4 flex w-full items-center gap-4">
			<h2 class="card-title">Krabbelviechs</h2>
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
					{#each resources as resource (resource.type)}
						<!-- <li><button on:click={() => downloadCSV(resource)}>Daten exportieren ({resource.name})</button></li> -->
						<li><a href={`/bugStats/${resource.type}`}>Statistik anzeigen ({resource.name})</a></li>
						<li><a href={`/manage/${resource.type}`}>Einträge bearbeiten ({resource.name})</a></li>
					{/each}
				</ul>
			</div>
		</div>

		<!-- Buttons für alle Bugs -->
		<div class="flex w-full flex-wrap justify-center gap-4">
			{#each resources as resource (resource.type)}
				<button
					on:click={() => handleClick(resource, false)}
					class={buttonClass(resource.type)}
					disabled={buttonStatus[resource.type]}
				>
					{#if buttonStatus[resource.type]}Gespeichert ✓{:else}{resource.name}{/if}
				</button>
			{/each}

			<!-- Plüschi Dropdown für alle Bugs -->
			<div class="relative w-[45%]">
				<button
					bind:this={plushieButtonRef}
					on:click={toggleRareDropMenu}
					class="flex h-20 w-full items-center justify-center rounded-lg bg-purple-500 text-base text-white shadow-md transition-all duration-200 hover:bg-purple-400 active:scale-95 sm:text-lg"
				>
					Plüschi
				</button>
				{#if showRareDropMenu}
					<div
						class="absolute left-0 z-40 mt-2 w-48 rounded-lg bg-white shadow-lg"
						style="top: {rareDropMenuDirection === 'down'
							? '100%'
							: 'auto'}; bottom: {rareDropMenuDirection === 'up' ? '100%' : 'auto'};"
					>
						{#each resources as resource (resource.type)}
							<button
								on:click={() => handleRareDrop(resource)}
								class="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
							>
								{resource.name}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<div class="mt-2 hidden flex-col items-center gap-2 sm:flex">
			{#each resources as resource (resource.type)}
				<!-- <button on:click={() => downloadCSV(resource)} class="btn btn-outline btn-success w-48">
					Daten exportieren ({resource.name})
				</button> -->
				<a href={`/bugStats/${resource.type}`} class="btn btn-link"
					>Statistik anzeigen ({resource.name})</a
				>
				<a href={`/manage/${resource.type}`} class="btn btn-link"
					>Einträge bearbeiten ({resource.name})</a
				>
			{/each}
		</div>
	</div>
</div>
