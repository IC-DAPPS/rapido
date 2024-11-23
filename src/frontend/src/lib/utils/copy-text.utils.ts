import { toast } from 'svelte-sonner';

let toastId: string | number;

export function copyText(text: string) {
	navigator.clipboard
		.writeText(text)
		.then(() => {
			// Handle successful copy
			toastId = toast.success('Copied to clipboard', {
				id: toastId
			});
		})
		.catch((err) => {
			// Handle copy error
			console.error('Error copying text:', err);
		});
}
