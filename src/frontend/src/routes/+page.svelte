<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import DarkModeToggle from '@components/DarkMode/DarkModeToggle.svelte';
	import QrCodeGenerator from '@components/QrCode/QrCodeGenerator.svelte';

	import AuthButton from '@components/AuthButton/AuthButton.svelte';
</script>

<AuthButton />

<DarkModeToggle />

<QrCodeGenerator
	value={'dwx4w-plydf-jxgs5-uncbu-mfyds-5vjzm-oohax-gmvja-cypv7-tmbt4-dqe'}
	ariaLabel={'QR code'}
	size={250}
	radius={0}
	ecLevel={'M'}
>
	{#snippet logo()}
		<img
			src="https://assets.coingecko.com/coins/images/33818/standard/01_ckBTC_Token_HEX__4x.png?1703046026"
			alt="logo"
			class="h-10 w-10"
		/>
	{/snippet}
</QrCodeGenerator>
