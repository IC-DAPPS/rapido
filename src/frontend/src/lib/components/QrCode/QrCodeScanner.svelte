<script lang="ts">
	import { Html5Qrcode, Html5QrcodeSupportedFormats, type Html5QrcodeResult } from 'html5-qrcode';
	import type { Html5QrcodeError, QrDimensionFunction, QrDimensions } from 'html5-qrcode/esm/core';

	import { Loader } from 'lucide-svelte';
	import { onDestroy, onMount } from 'svelte';

	let {
		onScanSuccess = () => {},
		onScanFailure = () => {}
	}: {
		onScanSuccess: (content: string) => void;
		onScanFailure: (errorMessage: string) => void;
	} = $props();

	let html5Qrcode: Html5Qrcode;

	onMount(() => {
		init();
		start();
	});
	onDestroy(() => {
		stop();
	});

	function init() {
		html5Qrcode = new Html5Qrcode('reader', {
			formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
			verbose: true,
			useBarCodeDetectorIfSupported: false
		});
	}

	function start() {
		html5Qrcode.start(
			{ facingMode: 'environment' },
			{
				fps: 10,
				qrbox: getQrboxDimensions(),
				aspectRatio: 1
			},
			qrCodeSuccessCallback,
			qrCodeErrorCallback
		);
	}

	function qrCodeSuccessCallback(decodedText: string, decodedResult: Html5QrcodeResult) {
		//Code matched = upi://pay?pa=ahdrahees0-1@oksbi&pn=Ahammed%20Rahees&aid=uGICAgID1-NvoXg
		// alert(`Code matched = ${decodedText}`);
		//
		onScanSuccess(decodedText);
		stop();
	}

	/**
	 * This function is called immediately after the scanner is launched. because its looking for qr code for 1/10 Sec (fps = 10).
	 * And most probably it will not find any qr code.
	 * This will result calling onScanFailure immediately after the scanner is launched.
	 *  So model component will be closed immediately since it also use onScanFailure callback event to close the model as well as notify user scanning failed using toast.
	 *
	 * To fix this we are using a timeout this will start on onMount then after 30 seconds it will enable onScanFailure callback.
	 */
	function qrCodeErrorCallback(errorMessage: string, error: Html5QrcodeError) {
		// console.log(error);
		// console.warn(`Code scan error = ${errorMessage}`);

		if (enableOnScanFailure) onScanFailure(errorMessage);
	}

	async function stop() {
		await html5Qrcode.stop();
	}

	function getQrboxDimensions(): QrDimensionFunction {
		return (viewfinderWidth: number, viewfinderHeight: number): QrDimensions => {
			const squareSize = isMobileDevice() ? 250 : 300;
			return {
				width: squareSize,
				height: squareSize
			};
		};
	}

	function isMobileDevice(): boolean {
		return window.innerWidth <= 768;
	}

	function getAspectRatio(): number {
		return isMobileDevice() ? 0.5625 : 1.0; // 9:16 for mobile, 1:1 for larger screens
	}

	let enableOnScanFailure = false;

	onMount(() => {
		setTimeout(() => {
			enableOnScanFailure = true;
		}, 30000);
	});
</script>

<article class="reader" id="reader"><Loader class="h-7 w-7 animate-spin" /></article>

<style>
	.reader {
		position: relative;
		overflow: hidden;
		width: 100%;
		max-width: 462px;
		aspect-ratio: 1 / 1;
	}
</style>
