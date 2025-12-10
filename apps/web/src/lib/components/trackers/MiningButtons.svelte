<script lang="ts">
	import type { MiningResource } from '$lib/storage';
	import { resourceStore } from '$lib/stores/resourceStore';
	import { _ } from 'svelte-i18n';

	let { resource } = $props<{ resource: MiningResource }>();

	let attemptButtonActive = $state(false);
	let plushButtonActive = $state(false);

	function flashButton(setter: (state: boolean) => void) {
		setter(true);
		setTimeout(() => setter(false), 500);
	}

	function handleAttempt() {
		resourceStore.addEntry(resource.type, false);
		flashButton((state) => (attemptButtonActive = state));
	}

	function handlePlushie() {
		resourceStore.addEntry(resource.type, true);
		flashButton((state) => (plushButtonActive = state));
	}
</script>

<button
	onclick={handleAttempt}
	class="btn btn-soft btn-primary flex h-20 w-[45%] items-center justify-center rounded-lg"
	disabled={attemptButtonActive}
>
	{#if attemptButtonActive}
		{$_('ui.saved')}
	{:else}
		{$_(`resources.${resource.type}.label`)}
	{/if}
</button>

<button
	onclick={handlePlushie}
	class="btn btn-soft btn-secondary flex h-20 w-[45%] items-center justify-center rounded-lg shadow-md transition-all duration-200 hover:bg-purple-400 active:scale-95 sm:text-lg"
	disabled={plushButtonActive}
>
	{#if plushButtonActive}
		{$_('ui.saved')}
	{:else}
		{$_('ui.plushie')}
	{/if}
</button>
