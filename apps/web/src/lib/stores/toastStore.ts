// src/lib/stores/toastStore.ts
import { writable } from 'svelte/store';

export interface ToastMessage {
	id: number;
	message: string;
	type: 'success' | 'error' | 'info' | 'warning'; // DaisyUI alert types
	duration?: number; // Optional duration in ms
}

const defaultDuration = 3000; // Default time a toast is visible

// Create a writable store that holds an array of toast messages
const { subscribe, update } = writable<ToastMessage[]>([]);

export const toasts = {
	subscribe,
	add: (
		message: string,
		type: ToastMessage['type'] = 'info',
		duration: number = defaultDuration
	) => {
		const id = Date.now() + Math.random(); // Simple unique ID

		update((allToasts) => {
			// Add the new toast to the beginning of the array for typical top-down display
			return [{ id, message, type, duration }, ...allToasts];
		});

		// Automatically remove the toast after its duration
		setTimeout(() => {
			toasts.remove(id);
		}, duration);
	},
	remove: (id: number) => {
		update((allToasts) => allToasts.filter((t) => t.id !== id));
	},
	success: (message: string, duration?: number) => {
		toasts.add(message, 'success', duration);
	},
	error: (message: string, duration?: number) => {
		toasts.add(message, 'error', duration);
	},
	info: (message: string, duration?: number) => {
		toasts.add(message, 'info', duration);
	},
	warning: (message: string, duration?: number) => {
		toasts.add(message, 'warning', duration);
	}
};
