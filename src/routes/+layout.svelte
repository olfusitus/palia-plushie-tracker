<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-100 via-sky-100 to-blue-200">
	{@render children()}
</div>
