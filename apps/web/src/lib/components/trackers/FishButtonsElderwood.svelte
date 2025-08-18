<script lang="ts">
	import type { FishResource } from '$lib/storage';
	import { resourceStore } from '$lib/stores/resourceStore';
	import { _ } from 'svelte-i18n';

	let {
		resource
	}: {
		resource: FishResource;
	} = $props<{ resource: FishResource }>();

	let buttonStatus = $state(false);
	let dropdownButtonStatus = $state(false);

	// Define the plush options for elderwood fish
	const plushOptions = ['maws', 'shark', 'maws_fin', 'shark_fin', 'floatfish_toadstool', 'floatfish_piksii', 'floatfish_midnight'];

	function handleClick(plushie: boolean) {
		resourceStore.addEntry(resource.type, plushie);
		buttonStatus = true;
		setTimeout(() => {
			buttonStatus = false;
		}, 500);
	}

	function handlePlushieDrop(plushType: string) {
		resourceStore.addEntry(resource.type, true, plushType);
		dropdownButtonStatus = true;
		setTimeout(() => {
			dropdownButtonStatus = false;
		}, 500);
		openDropdown = false;
	}

	let detailsRef: HTMLDetailsElement;
	let openDropdown: boolean = $state<boolean>(false);

	function handleClickOutside(event: MouseEvent) {
		if (openDropdown && detailsRef && !detailsRef.contains(event.target as Node)) {
			openDropdown = false;
		}
	}

	$effect(() => {
		if (openDropdown) {
			document.addEventListener('mousedown', handleClickOutside);

			return () => {
				document.removeEventListener('mousedown', handleClickOutside);
			};
		}
	});
</script>

<button
	onclick={() => handleClick(false)}
	class="btn btn-soft btn-primary flex h-20 w-[45%] rounded-lg"
	disabled={buttonStatus}
>
	{#if buttonStatus}{$_('ui.saved')}{:else}{$_(`resources.${resource.type}.labels.no_plush`)}{/if}
</button>

<details class="dropdown w-[45%]" bind:open={openDropdown} bind:this={detailsRef}>
	<summary
		class="btn flex h-20 w-full items-center justify-center rounded-lg bg-purple-500 text-base text-white shadow-md transition-all duration-200 hover:bg-purple-400 active:scale-95 sm:text-lg"
	>
		{#if dropdownButtonStatus}{$_('ui.saved')}{:else}{$_('ui.plushie')}{/if}
	</summary>
	<ul class="menu dropdown-content bg-base-300 rounded-box w-52 p-2 shadow-sm">
		{#each plushOptions as plushType (plushType)}
			<li>
				<button onclick={() => handlePlushieDrop(plushType)}>
					{$_(`resources.${resource.type}.labels.${plushType}`)}
				</button>
			</li>
		{/each}
	</ul>
</details>
