<script lang="ts">
	import { ArrowLeft, CircleAlert } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Button from '@components/ui/button/button.svelte';
	import { balance } from '@states/balance.svelte';
	import { onMount } from 'svelte';
	import {
		convertCkBTCToBtcIcrc2,
		fetchEstimateWithdrawalFee,
		fetchMinterInfo
	} from '@services/btc-withdraw.service';
	import { minterInfo } from '@states/btc-withdraw.svelte';
	import { parseBtcAddress } from '@dfinity/ckbtc';
	import { BTC_NETWORK } from '@constants/app.constants';
	import { invalidBtcAddress } from '@utils/btc-address.utils';
	import { slide } from 'svelte/transition';
	import ButtonWithLoader from '$lib/ButtonWithLoader/ButtonWithLoader.svelte';
	import { getWithdrawalAccount } from '$lib/api/ck-btc-minter.api';
	import { authStore } from '@stores/auth.store';
	import { encodeIcrcAccount } from '@dfinity/ledger-icrc';
	import QrCodeScanner from '@components/QrCode/QrCodeScanner.svelte';
	import QrCodeScanModel from '@components/QrCode/QrCodeScanModel.svelte';

	onMount(async () => {
		await fetchMinterInfo();
		await fetchEstimateWithdrawalFee();
	});

	let amount: number | undefined = $state<number>();
	let address = $state('');

	let isAmountTouched = $state(false);
	let isAddressTouched = $state(false);

	let enableAddressError = $derived(invalidBtcAddress({ address, network: BTC_NETWORK }));

	let enableAmountError = $derived.by(() => {
		const currentAmount = amount ?? 0;
		return currentAmount < minterInfo.retrieve_btc_min_amount || currentAmount > balance.value;
	});

	let loader = $state(false);
	let disabled = $derived(enableAddressError || enableAmountError);
	// let enableAddressError = $derived();
	// Please enter an amount no higher than your available balance.
	// Amount to redeem must be at least 0.10000000

	const getAmountErrorMessage = () => {
		const currentAmount = amount ?? 0;
		if (currentAmount < minterInfo.retrieve_btc_min_amount) {
			return `Amount to redeem must be at least ${minterInfo.retrieve_btc_min_amount}`;
		}

		if (currentAmount > balance.value) {
			return 'Please enter an amount no higher than your available balance.';
		}
	};

	const onclick = async () => {
		loader = true;
		await convertCkBTCToBtcIcrc2({ amount: amount ?? 0, address });

		loader = false;
	};
</script>

<a href="/business"><ArrowLeft class="left-5 top-5" /></a>

<p class="text-center text-2xl">Withdraw Bitcoin</p>

<div class="flex w-full flex-col gap-1.5">
	<Label for="btc-address">Bitcoin Receiving Address</Label>
	<div class="relative">
		<input
			bind:value={address}
			type="text"
			id="btc-address"
			placeholder="Enter you address"
			class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
			required
			onchange={() => (isAddressTouched = true)}
		/>

		<div
			class="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center gap-3 text-gray-500"
		>
			<QrCodeScanModel bind:value={address} onScanSuccess={() => (isAddressTouched = true)} />
		</div>
	</div>

	{#if enableAddressError && isAddressTouched}
		<div class=" text-red-500" transition:slide={{ duration: 200 }}>
			<p class="ml-1 text-xs">
				<CircleAlert class="inline" size={15} />
				The withdrawal address format is wrong. Please check the withdrawal address length and character
				content and try again.
			</p>
		</div>
	{/if}
</div>

<div class="flex w-full flex-col gap-1.5">
	<Label for="amount">Amount</Label>
	<div class="relative">
		<input
			bind:value={amount}
			type="number"
			id="amount"
			min={minterInfo.retrieve_btc_min_amount}
			placeholder="Minimum {minterInfo.retrieve_btc_min_amount}"
			class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
			required
			onchange={() => (isAmountTouched = true)}
		/>
		{#if balance.value > 0}
			<div class="absolute right-3 top-1/2 -translate-y-1/2 gap-3 text-gray-500">
				<button
					class="text-sm underline hover:text-primary"
					onclick={() => (amount = balance.value)}>Max</button
				>
			</div>
		{/if}
	</div>
	<p class="text-sm text-muted-foreground">
		Balance: <span class="font-medium">{balance.value} BTC</span>
	</p>

	{#if enableAmountError && isAmountTouched}
		<div class=" text-red-500" transition:slide={{ duration: 200 }}>
			<p class="ml-1 text-xs">
				<CircleAlert class="inline" size={15} />
				{getAmountErrorMessage()}
			</p>
		</div>
	{/if}
</div>

<ButtonWithLoader {disabled} {loader} {onclick}>Withdraw</ButtonWithLoader>

<style>
	/* Remove arrows for Chrome, Safari, Edge, Opera */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Remove arrows for Firefox */
	input[type='number'] {
		-moz-appearance: textfield;
	}
</style>
