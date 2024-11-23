<script lang="ts">
	import ButtonWithLoader from '$lib/ButtonWithLoader/ButtonWithLoader.svelte';
	import QrCodeGenerator from '@components/QrCode/QrCodeGenerator.svelte';
	import { fetchBTCDepositAddress, updateCkBTCBalanceMinter } from '@services/btc-deposit.service';
	import { btcDepositAddress } from '@states/btc-deposit-address.svelte';
	import { copyText } from '@utils/copy-text.utils';
	import { ArrowLeft, Loader } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { BTC_BLOCK_EXPLORER_URL } from '@constants/app.constants';

	let size = 200;
	onMount(async () => {
		if (window.innerWidth >= 1280) {
			size = 300;
		}

		await fetchBTCDepositAddress();
	});

	let loader = false;
</script>

<a href="/business"><ArrowLeft class="left-5 top-5" /></a>

<p class="text-center text-2xl">Deposit Bitcoin</p>

{#if btcDepositAddress.address}
	<QrCodeGenerator
		value={'dwx4w-plydf-jxgs5-uncbu-mfyds-5vjzm-oohax-gmvja-cypv7-tmbt4-dqe'}
		ariaLabel="QR code"
		{size}
		radius={0}
		ecLevel={'M'}
		>{#snippet logo()}
			<img src="/logo/token/Bitcoin.svg" alt="ckbtc logo" class="h-10 w-10 xl:h-14 xl:w-14" />
		{/snippet}</QrCodeGenerator
	>
{:else}
	<div class="flex justify-center">
		<div
			class=" flex h-[224px] w-[224px] animate-pulse items-center justify-center bg-secondary xl:h-[324px] xl:w-[324px]"
		>
			<Loader class="h-20 w-10 animate-spin" />
		</div>
	</div>
{/if}

<div class="flex flex-col items-center gap-0.5">
	<h2 class="text-center">Bitcoin Address:</h2>
	{#if btcDepositAddress.address}
		<button
			class="text-center underline-offset-4 hover:underline"
			onclick={() => {
				copyText(btcDepositAddress.address ?? '');
			}}>{btcDepositAddress.address}</button
		>
	{:else}
		<div>
			<div class=" h-4 w-[348px] animate-pulse rounded-full bg-secondary"></div>
		</div>
	{/if}
</div>

<div class="flex justify-center">
	<ButtonWithLoader
		class="w-48 border border-primary text-primary"
		variant="outline"
		{loader}
		onclick={async () => {
			loader = true;

			await updateCkBTCBalanceMinter();

			loader = false;
		}}>Check for incoming BTC</ButtonWithLoader
	>
</div>

<div class="text-wrap px-2 text-sm text-muted-foreground">
	Note: incoming Bitcoin transactions require 6 confirmations. Check status on a <a
		class="underline hover:text-primary"
		href={`${BTC_BLOCK_EXPLORER_URL}address/${btcDepositAddress.address}`}>block explorer</a
	>.
</div>
