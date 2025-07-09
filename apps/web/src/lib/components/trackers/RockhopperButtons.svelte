<script lang="ts">
	import type { BugResource } from '$lib/storage';
	import type { ResourceSize } from '$lib/storage/types';
	import { resourceStore } from '$lib/stores/resourceStore';
	import { _ } from 'svelte-i18n';

	let { resource } = $props<{ resource: BugResource }>();

	let buttonStatus: Record<string, boolean> = $state({});

	if (resource.availableSizes) {
		for (const size of resource.availableSizes) {
			buttonStatus[size] = false;
		}
	}

	function buttonClass(size: string): string {
		const base =
			'btn w-[45%] h-20 sm:text-lg rounded-lg shadow-md active:scale-95 active:shadow-inner text-white';
		const activeClass = 'bg-green-600!';

		const styleByType: Record<string, string> = {
			small: 'bg-amber-400 hover:bg-amber-300',
			medium: 'bg-orange-400 hover:bg-orange-300',
			large: 'bg-rose-400 hover:bg-rose-300'
		};
		const active = buttonStatus[size];
		return active ? `${base} ${activeClass}` : `${base} ${styleByType[size]}`;
	}

	function handleClick(size: string, plushie: boolean) {
		resourceStore.addEntry(resource.type, plushie, size as ResourceSize);
		buttonStatus[size] = true;
		setTimeout(() => {
			buttonStatus[size] = false;
		}, 500);
	}

	// svelte-ignore non_reactive_update
	let detailsRef: HTMLDetailsElement;
	let openDropdown: boolean = $state<boolean>(false);

	function handleRareDrop(size: string) {
		handleClick(size, true);
		openDropdown = false;
	}

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

{#if resource.availableSizes}
	{#each resource.availableSizes as size (size)}
		<button
			onclick={() => handleClick(size, false)}
			class={buttonClass(size)}
			disabled={buttonStatus[size]}
		>
			{#if buttonStatus[size]}{$_('ui.saved')}{:else}{$_(
					`resources.${resource.type}.labels.${size}`
				)}{/if}
		</button>
	{/each}
	<details class="dropdown w-[45%]" bind:open={openDropdown} bind:this={detailsRef}>
		<summary
			class="btn flex h-20 w-full items-center justify-center rounded-lg bg-purple-500 text-base text-white shadow-md transition-all duration-200 hover:bg-purple-400 active:scale-95 sm:text-lg"
		>
			{$_('ui.plushie')}
		</summary>
		<ul class="menu dropdown-content bg-base-300 rounded-box w-52 p-2 shadow-sm">
			{#each resource.availableSizes as size (size)}
				<li>
					<button onclick={() => handleRareDrop(size)}>
						{$_(`resources.${resource.type}.labels.${size}`)}
					</button>
				</li>
			{/each}
		</ul>
	</details>
{/if}
