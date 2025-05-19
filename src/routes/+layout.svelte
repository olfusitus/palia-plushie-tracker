<script lang="ts">
	import '../app.css';
	let { children } = $props();

	import { onMount } from 'svelte';
	import { migratePaliaData } from '$lib/utils/migration';

	onMount(() => {
		migratePaliaData();
	});
</script>

<div class="min-h-screen bg-gradient-to-br from-base-100 via-primary/10 to-base-200 flex flex-col">
	<nav class="navbar bg-base-100 shadow-md rounded-b-xl px-4 py-2 mb-8">
		<div class="navbar-start">
			<a href="/" class="btn btn-ghost normal-case text-xl text-primary">Palia Tracker</a>
		</div>
		<div class="navbar-center hidden md:flex">
			<ul class="menu menu-horizontal px-1 gap-2">
				<li><a href="/ores/ore_gold" class="text-base">Gold</a></li>
				<li><a href="/ores/ore_silver" class="text-base">Silber</a></li>
				<li><a href="/animals" class="text-base">Tierchen</a></li>
			</ul>
		</div>
		<div class="navbar-end">
			<a href="/manage/profiles" class="btn btn-outline btn-sm">Verwalten</a>
		</div>
	</nav>

	<main class="flex-1 flex flex-col items-center justify-start px-2 md:px-4 py-6 w-full">
			{@render children()}
	</main>

	<footer class="footer footer-center p-4 bg-base-100 text-base-content rounded-t-xl mt-8">
		<div>
			<p class="text-sm opacity-70">&copy; {new Date().getFullYear()} Palia Ore & Hunting Tracker</p>
		</div>
	</footer>
</div>
