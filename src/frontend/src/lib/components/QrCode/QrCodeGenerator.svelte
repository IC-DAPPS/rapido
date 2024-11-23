<script lang="ts">
	import QrCreator from 'qr-creator';
	import { nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		value: string;
		ariaLabel: string;
		size: number;
		radius: number;
		logo: Snippet | undefined;
		ecLevel: QrCreator.ErrorCorrectionLevel;
	}
	let { value, ariaLabel = '', size = 400, ecLevel = 'H', radius = 0, logo }: Props = $props();

	let container: HTMLDivElement | undefined;
	let canvas: HTMLCanvasElement;

	let fill = 'black';
	let background = 'white';

	function generateQR() {
		if (nonNullish(canvas) || nonNullish(size)) {
			QrCreator.render(
				{
					text: value,
					radius,
					ecLevel, // 'L' | 'M' | 'Q' | 'H'
					fill,
					background,
					// We draw the canvas larger and scale its container down to avoid blurring on high-density displays
					size: size * 2
				},
				canvas
			);
		}
	}

	$effect(() => {
		generateQR();
	});
</script>

<div bind:this={container} class="container bg-white p-3" data-tid="qr-code">
	<canvas
		bind:this={canvas}
		aria-label={ariaLabel}
		style={`width: ${size > 0 ? `${size}px` : '100%'}; height: ${size > 0 ? `${size}px` : '100%'}`}
	>
	</canvas>

	{#if logo}
		<div class="logo rounded-full bg-white p-1.5">{@render logo()}</div>
	{/if}
</div>

<style>
	.container {
		position: relative;
		width: fit-content;
	}

	.logo {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
