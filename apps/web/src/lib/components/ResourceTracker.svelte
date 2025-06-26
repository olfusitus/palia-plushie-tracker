<script lang="ts">
	import { exportResourceAsCSV, downloadFile } from '$lib/utils/exporter';
	import type { ResourceType } from '$lib/storage/types';
	// import { test } from 'vitest';

	let { title, resourceType, children } = $props<{
		title: string;
		resourceType: ResourceType;
		children: () => unknown;
	}>();

	function handleDownloadCSV() {
		const csv = exportResourceAsCSV(resourceType);
		downloadFile(csv, `${resourceType}_data.csv`);
	}
</script>

<div class="card bg-base-100 border-base-300 mb-8 w-full border shadow-xl">
	<div class="card-body w-full px-4">
		<div class="mb-4 flex w-full items-center gap-4">
			<h2 class="card-title">{title}</h2>
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
					<li><button onclick={handleDownloadCSV}>Daten exportieren (CSV)</button></li>
					<li>
						{#if resourceType.startsWith('animal_')}
							<a href={`/huntingStats/${resourceType}`}>Statistik anzeigen</a>
						{/if}
						{#if resourceType.startsWith('bug_')}
							<a href={`/bugStats/${resourceType}`}>Statistik anzeigen</a>
						{/if}
					</li>
					<li><a href={`/manage/${resourceType}`}>Einträge bearbeiten</a></li>
				</ul>
			</div>
		</div>

		<div class="flex w-full flex-wrap justify-center gap-4">
			{@render children()}
		</div>

		<!-- <div class="divider my-2 hidden sm:block">Aktionen</div> -->
		<div class="mt-2 hidden flex-col items-center gap-2 sm:flex">
			<button onclick={handleDownloadCSV} class="btn btn-outline btn-success w-48">
				Daten exportieren (CSV)
			</button>
			{#if resourceType.startsWith('animal_')}
				<a href={`/huntingStats/${resourceType}`} class="btn btn-link">Statistik anzeigen</a>
			{/if}
			{#if resourceType.startsWith('bug_')}
				<a href={`/bugStats/${resourceType}`} class="btn btn-link">Statistik anzeigen</a>
			{/if}
			<a href={`/manage/${resourceType}`} class="btn btn-link">Einträge bearbeiten</a>
		</div>
	</div>
</div>
