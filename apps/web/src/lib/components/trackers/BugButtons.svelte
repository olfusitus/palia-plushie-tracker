<script lang="ts">
	import type { BugResource } from '$lib/storage';
	import { resourceStore } from '$lib/stores/resourceStore';

	let { resource } = $props<{ resource: BugResource }>();

	let buttonStatus = $state(false);

	function handleClick(plushie: boolean) {
		resourceStore.addEntry(resource.type, plushie);
		buttonStatus = true;
		setTimeout(() => {
			buttonStatus = false;
		}, 500);
	}

	function handleRareDrop() {
		handleClick(true);
	}
</script>

<button
	onclick={() => handleClick(false)}
	class="btn btn-soft btn-primary flex h-20 w-[45%] rounded-lg"
	disabled={buttonStatus}
>
	{#if buttonStatus}Gespeichert ✓{:else}{resource.name}{/if}
</button>

<button
	onclick={handleRareDrop}
	class="btn btn-soft btn-secondary flex h-20 w-[45%] items-center justify-center rounded-lg shadow-md transition-all duration-200 hover:bg-purple-400 active:scale-95 sm:text-lg"
>
	Plüschi
</button>
