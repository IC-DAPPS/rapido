<script lang="ts">
	import { Html5Qrcode, Html5QrcodeSupportedFormats, type Html5QrcodeResult } from 'html5-qrcode';
	import type { Html5QrcodeError, QrDimensionFunction, QrDimensions } from 'html5-qrcode/esm/core';

	import { Loader } from 'lucide-svelte';
	import { onDestroy, onMount } from 'svelte';

	let { onScanSuccess = () => {}, onScanFailure = () => {} } = $props();

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

	function qrCodeErrorCallback(errorMessage: string, error: Html5QrcodeError) {
		// console.log(error);
		// console.warn(`Code scan error = ${errorMessage}`);
		//
		onScanFailure(errorMessage);
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
