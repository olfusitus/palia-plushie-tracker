<script lang="ts">
	import { chartRender } from '$lib/actions/chartRender';
	import { _ } from 'svelte-i18n';
	import type { StatResult } from '$lib/utils/statistics';
	import type { buildDistanceHistogramData } from '$lib/utils/chartData';
	import type { ResourceType } from '$lib/storage/types';

	export let stats: StatResult & { barData: ReturnType<typeof buildDistanceHistogramData> };
	// export let resourceType: ResourceType;
	export let resourceName: string;
	export let resourceType: ResourceType;
	// export let getResourceName: (resourceType: ResourceType, typ?: string) => string;

	function formatEntryToken(token: string) {
		return token
			.split('_')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ');
	}

	function getPlushLabel(plushType: string) {
		const label = $_(`resources.${resourceType}.labels.${plushType}`);
		return label === `resources.${resourceType}.labels.${plushType}`
			? formatEntryToken(plushType)
			: label;
	}
</script>

<div class="card bg-base-100 border-base-200 border shadow-xl">
	<div class="card-body items-center p-4 text-center">
		<h2 class="card-title mb-2 capitalize">{resourceName}</h2>
		<div class="mb-2 flex flex-wrap justify-center gap-2">
			<span class="badge badge-primary">{$_(`stats.entries`)}: {stats.count}</span>
			<span class="badge badge-secondary">{$_(`stats.plushies`)}: {stats.totalRareDrops}</span>
			<span class="badge badge-accent">{$_(`stats.share`)}: {stats.share}</span>
		</div>
		{#if Object.keys(stats.plushBreakdown).length > 0}
			<div class="divider my-2">{$_(`stats.plush_breakdown`)}</div>
			<div class="mb-2 flex flex-wrap justify-center gap-2">
				{#each Object.entries(stats.plushBreakdown) as [plushType, plushCount] (plushType)}
					<span class="badge badge-outline badge-secondary"
						>{getPlushLabel(plushType)}: {plushCount}</span
					>
				{/each}
			</div>
		{/if}
		<div class="divider my-2">{$_(`stats.distances`)}</div>
		<div class="flex w-full flex-col gap-1">
			<div
				class="border-base-content bg-base-200 flex w-full items-start justify-between rounded border px-3 py-1 text-sm"
			>
				<span>{$_(`stats.avg_distance`)}</span>
				<span>{stats.avgDistance.toFixed(2)}</span>
			</div>
			<div class="flex w-full gap-1">
				<div
					class="border-base-content bg-base-200 flex flex-1 items-start justify-between rounded border px-3 py-1 text-sm"
				>
					<span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-6"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"
							/>
						</svg>
					</span>
					<span>{stats.lowestDistance}</span>
				</div>
				<div
					class="border-base-content bg-base-200 flex flex-1 items-start justify-between rounded border px-3 py-1 text-sm"
				>
					<span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-6"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 18.75 7.5-7.5 7.5 7.5" />
							<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 7.5-7.5 7.5 7.5" />
						</svg>
					</span>
					<span>
						{stats.highestDistance > stats.timeSinceLast
							? stats.highestDistance
							: stats.timeSinceLast}
					</span>
				</div>
			</div>
			<div
				class="border-base-content bg-base-200 flex w-full items-start justify-between rounded border px-3 py-1 text-sm"
			>
				<span class="pr-1">{$_(`stats.last_10_distances`)}</span>
				<span>
					{stats.allDistances.length
						? stats.allDistances.slice(-10).join(' → ')
						: $_(`stats.no_distances`)}</span
				>
			</div>
			<div
				class="border-base-content bg-base-200 flex w-full items-start justify-between rounded border px-3 py-1 text-sm"
			>
				<span>{$_(`stats.last_drop_distance`)}</span>
				<span>{stats.timeSinceLast}</span>
			</div>
			<div
				class="border-base-content bg-base-200 flex w-full items-start justify-between rounded border px-3 py-1 text-sm"
			>
				<canvas use:chartRender={stats.barData}></canvas>
			</div>
		</div>
	</div>
</div>
