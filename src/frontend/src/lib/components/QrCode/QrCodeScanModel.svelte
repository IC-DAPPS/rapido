<script lang="ts">
	import QrCodeScanner from '@components/QrCode/QrCodeScanner.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { ScanQrCode } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let {
		value = $bindable(),
		onScanSuccess = () => {}, //default if no prop passed
		size
	}: { value: string; onScanSuccess?: (content: string) => void ; size?:number} = $props();

	let toastId: string | number;

	const onQrScanSuccess = (content: string) => {
		value = content;

		open = false;

		onScanSuccess(content);

		toastId = toast.success('QR Code scan success!.', { id: toastId });
	};

	const onQrScanFailure = (errorMessage: string) => {
		console.warn(`Code scan error = ${errorMessage}`);

		open = false;

		if (errorMessage.includes('NotFoundException')) {
			toastId = toast.error('No QR Code Detected.', { id: toastId });
		} else {
			toastId = toast.error(`QR Code scan failed!. ${errorMessage}`, { id: toastId });
		}
	};

	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger><ScanQrCode size={size}/></Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Scan QR Code</Dialog.Title>
		</Dialog.Header>
		<QrCodeScanner onScanSuccess={onQrScanSuccess} onScanFailure={onQrScanFailure} />
	</Dialog.Content>
</Dialog.Root>
