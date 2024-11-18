<script lang="ts">
	import QrCodeScanner from '@components/QrCode/QrCodeScanner.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { ScanQrCode } from 'lucide-svelte';

	let value = $state();
	const onScanSuccess = (content: string) => {
		value = content;
		open = false;
	};
	let open = $state(false);
</script>

<h1>Scanned Value {value}</h1>

<Dialog.Root bind:open>
	<Dialog.Trigger><ScanQrCode /></Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Scan QR Code</Dialog.Title>
		</Dialog.Header>
		<QrCodeScanner {onScanSuccess} />
	</Dialog.Content>
</Dialog.Root>
