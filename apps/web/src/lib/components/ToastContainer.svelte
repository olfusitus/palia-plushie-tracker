<!-- src/lib/components/ToastContainer.svelte -->
<script lang="ts">
	import { toasts, type ToastMessage } from '$lib/stores/toastStore';
	import { fly } from 'svelte/transition'; // Optional: for a nice animation

	// Function to map toast type to DaisyUI alert class
	function getAlertClass(type: ToastMessage['type']): string {
		switch (type) {
			case 'success':
				return 'alert-success';
			case 'error':
				return 'alert-error';
			case 'warning':
				return 'alert-warning';
			case 'info':
			default:
				return 'alert-info';
		}
	}
</script>

{#if $toasts.length > 0}
	<!-- DaisyUI toast container. You can change position: toast-top, toast-bottom, toast-start, toast-end -->
	<div class="toast toast-top toast-end z-50 p-4">
		{#each $toasts as toast (toast.id)}
			<div
				class="alert {getAlertClass(toast.type)} shadow-lg"
				role="alert"
				in:fly={{ y: -20, duration: 300 }}
				out:fly={{ y: -20, duration: 200, opacity: 0 }}
			>
				<!-- <div class="flex-1"> -->
				<!-- You can add icons here based on type if you want -->
				<!-- Example: Success Icon -->
				{#if toast.type === 'success'}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				{/if}
				<!-- Example: Error Icon -->
				{#if toast.type === 'error'}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				{/if}
				{#if toast.type === 'warning'}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
				{/if}
				{#if toast.type === 'info'}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="h-6 w-6 shrink-0 stroke-current"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/></svg
					>
				{/if}
				<span>{toast.message}</span>
				<!-- </div> -->
				<!-- Optional: Add a close button -->
				<!-- <button class="btn btn-sm btn-ghost" on:click={() => toasts.remove(toast.id)}>Close</button> -->
			</div>
		{/each}
	</div>
{/if}

<style>
	/* Ensure toasts appear above other content */
	.toast {
		z-index: 9999;
	}
</style>
