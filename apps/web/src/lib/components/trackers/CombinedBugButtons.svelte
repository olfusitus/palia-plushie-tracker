<script lang="ts">
	import type { BugResource } from '$lib/storage';
	import { resourceStore } from '$lib/stores/resourceStore';
	import type { ResourceType } from '$lib/storage/types';
	import { _ } from 'svelte-i18n';

	let {
		resources
	}: {
		resources: BugResource[];
	} = $props<{ resources: BugResource[] }>();
	// let { resources } = $props<{ resources: BugResource[] }>();

	let buttonStatuses = $state<Record<string, boolean>>({});
	for (const resource of resources) {
		buttonStatuses[resource.type] = false;
	}

	// let showRareDropMenu = $state(false);
	// let rareDropMenuDirection = $state<'down' | 'up'>('down');

	function handleClick(resourceType: string, plushie: boolean) {
		resourceStore.addEntry(resourceType as ResourceType, plushie);

		// if (!plushie) {
		buttonStatuses[resourceType] = true;
		setTimeout(() => {
			buttonStatuses[resourceType] = false;
		}, 500);
		// }
	}

	function handleRareDrop(resourceType: string) {
		handleClick(resourceType, true);
		// showRareDropMenu = false;
	}

	function buttonClass(resourceType: string): string {
		const base =
			'btn w-[45%] h-20 sm:text-lg flex items-center justify-center rounded-lg shadow-md transition-all duration-200 ease-out active:scale-95 active:shadow-inner text-white';

		const activeClass = 'bg-green-600!';

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
		const active = buttonStatuses[resourceType];
		return active ? `${base} ${activeClass}` : `${base} ${color}`;
	}
</script>

{#each resources as resource (resource.type)}
	<button
		onclick={() => handleClick(resource.type, false)}
		class={buttonClass(resource.type)}
		disabled={buttonStatuses[resource.type]}
	>
		{#if buttonStatuses[resource.type]}Gespeichert ✓{:else}{$_(
				`resources.${resource.type}.name`
			)}{/if}
	</button>
{/each}

<!-- Plüschi Dropdown for all bugs -->
<details class="dropdown w-[45%]">
	<summary
		class="flex h-20 w-full items-center justify-center rounded-lg bg-purple-500 text-base text-white shadow-md transition-all duration-200 hover:bg-purple-400 active:scale-95 sm:text-lg"
	>
		Plüschi
	</summary>
	<ul class="menu dropdown-content bg-base-300 rounded-box z-[1] w-52 p-2 shadow-sm">
		{#each resources as resource (resource.type)}
			<li>
				<button onclick={() => handleRareDrop(resource.type)}
					>{$_(`resources.${resource.type}.name`)}</button
				>
			</li>
		{/each}
	</ul>
</details>
