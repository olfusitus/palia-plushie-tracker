<script lang="ts">
	import '../app.css';
	let { children } = $props();

	import { onMount } from 'svelte';
	// import { migrateToProfiles } from '$lib/utils/migration';
	import { writable } from 'svelte/store';
	import { listen } from '@tauri-apps/api/event';
	// import { addAEntry } from '$lib/storage';
	// import { triggerResourceEntriesRefresh } from '$lib/stores/resourceEntriesStore';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import { resourceStore } from '$lib/stores/resourceStore';

	onMount(() => {
		// migrateToProfiles();
		// eslint-disable-next-line no-undef
		if (__TAURI__) {
			// Nur wenn in Tauri
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			listen('ws-to-webview', (event: any) => {
				try {
					console.log('Received WebSocket event:', event.payload);
					if (typeof event.payload !== 'string') {
						throw new Error('Payload is not a string');
					}
					const data = JSON.parse(event.payload);
					// action: 'addEntry', resourceType: 'animal_chapaa', size: 'small', rareDrops: 0
					if (data.action === 'addEntry') {
						console.log('Received action:', data.action);
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						const { action, resourceType, size, rareDrops, incrementBy } = data;

						if (incrementBy == 1) {
							if (typeof size !== 'undefined') {
								resourceStore.addEntry(resourceType, rareDrops, size);
							} else {
								resourceStore.addEntry(resourceType, rareDrops);
							}
						} else {
							if (typeof size !== 'undefined') {
								resourceStore.addMultipleEntries(resourceType, rareDrops, incrementBy, size);
							} else {
								resourceStore.addMultipleEntries(resourceType, rareDrops, incrementBy);
							}
						}
						console.log('Added entry:', resourceType, rareDrops, size, incrementBy);

						return;
					}
					// const { action, key, value } = JSON.parse(event.payload);
					// if (action === 'setLocalStorage' && key) {
					// 	console.log(`[Tauri WS] ${key} set to`, value);
					// localStorage.setItem(key, JSON.stringify(value));
					// console.log(`[Tauri WS] ${key} set to`, value);
					//}
				} catch (e) {
					console.error('Invalid WebSocket payload:', e);
				}
			});
		}
	});

	const drawerOpen = writable(false);
	function closeDrawer() {
		drawerOpen.set(false);
	}
	// if (__TAURI__) {
	// 	console.log("Läuft in Tauri-Umgebung!");
	// }
</script>

<ToastContainer />

<div class="drawer">
	<input id="my-drawer-3" type="checkbox" class="drawer-toggle" bind:checked={$drawerOpen} />
	<div class="drawer-content bg-base-200 flex flex-col">
		<!-- Navbar -->
		<div class="navbar bg-base-300 w-full">
			<div class="navbar-start">
				<div class="flex-none lg:hidden">
					<label for="my-drawer-3" aria-label="open sidebar" class="btn btn-square btn-ghost">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="inline-block h-6 w-6 stroke-current"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16"
							></path>
						</svg>
					</label>
				</div>
				<div class=" btn btn-ghost text-primary text-xl normal-case">Palia Hunting Tracker</div>
			</div>

			<div class="navbar-center hidden flex-none lg:block">
				<ul class="menu menu-horizontal">
					<!-- Navbar menu content here -->
					<li>
						<a href="/animals"> Tierchen </a>
					</li>
					<li><a href="/bugs2">Käferchen</a></li>
					<li><a href="/bugs">Käferchen einzeln</a></li>
					<li><a href="/fish">Fischis</a></li>
					<li><a href="/manage/profiles"> Verwalten</a></li>
				</ul>
			</div>
			<div class="navbar-end">
				<!-- svelte-ignore a11y_consider_explicit_label -->
				<a href="/manage/profiles">
					<button class="btn btn-ghost btn-circle">
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
								d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
							/>
						</svg>
					</button>
				</a>
			</div>
		</div>
		<main
			class="container mx-auto flex w-full flex-1 flex-col items-center justify-start px-2 py-6 md:px-4"
		>
			{@render children()}
		</main>
		<footer class="footer footer-center bg-base-300 text-base-content mt-8 rounded-t-xl p-4">
			<div>
				<p class="text-sm opacity-70">&copy; {new Date().getFullYear()} Palia Hunting Tracker</p>
			</div>
		</footer>
	</div>
	<div class="drawer-side">
		<label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"></label>
		<ul class="menu bg-base-200 min-h-full w-80 p-4 text-lg">
			<!-- Sidebar content here -->
			<li><a href="/animals" onclick={closeDrawer}>Tierchen</a></li>
			<li><a href="/bugs2" onclick={closeDrawer}>Käferchen</a></li>
			<li><a href="/bugs" onclick={closeDrawer}>Käferchen einzeln</a></li>
			<li><a href="/fish" onclick={closeDrawer}>Fischis</a></li>
			<div class="divider"></div>
			<li>
				<a href="/manage/profiles" onclick={closeDrawer}>
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
							d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
						/>
					</svg>

					Verwalten</a
				>
			</li>
		</ul>
	</div>
</div>
