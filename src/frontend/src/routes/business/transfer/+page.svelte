<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { ArrowLeft, CircleAlert, CircleCheck, Loader, X } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import { getAccountFromPayIdService } from '@services/pay-id.service';
	import { nonNullish } from '@dfinity/utils';
	import type { Account } from '@dfinity/ckbtc';
	import { sanitizePayId } from '@utils/payId.utils';
	import QrCodeScanModel from '@components/QrCode/QrCodeScanModel.svelte';
	import { decodeIcrcAccount, decodePayment } from '@dfinity/ledger-icrc';
	import { balance } from '@states/balance.svelte';
	import ButtonWithLoader from '$lib/ButtonWithLoader/ButtonWithLoader.svelte';
	import Input from '@components/ui/input/input.svelte';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import Notearea from '@components/notearea/notearea.svelte';
	import { transferCkBTC } from '@services/ck-btc.service';

	const transferType: { value: 'Pay Id' | 'Account' }[] = [
		{ value: 'Pay Id' },
		{ value: 'Account' }
	];

	let value = $state<'Pay Id' | 'Account'>();

	const triggerContent = $derived(
		transferType.find((f) => f.value === value)?.value ?? 'Choose an option'
	);

	let payId: string = $state('');
	let account: string = $state('');
	let isPayIdTouched = $state(false);
	let isAccountTouched = $state(false);

	let isAccountFoundFromPayId = $state(false);
	let loader = $state(false);

	let enablePayIdError = $derived(!isAccountFoundFromPayId);
	let enableAccountError = $state(false);
	let isAmountTouched = $state(false);

	let amount: number | undefined = $state();

	let note = $state('');

	let enableAmountError = $derived.by(() => {
		const currentAmount = amount ?? 0;
		return currentAmount > balance.value || currentAmount <= 0;
	});

	let disabled = $derived.by(() => {
		if (value === 'Pay Id') {
			return enablePayIdError || enableAmountError;
		}
		return enableAccountError || enableAmountError;
	});
	let buttonLoader = $state(false);

	let icrcAccount: Account;

	const clearPayId = () => {
		payId = '';
	};

	const getAccountFromPayId = async () => {
		loader = true;
		const optAccount = await getAccountFromPayIdService(payId);
		if (nonNullish(optAccount)) {
			icrcAccount = optAccount;
			isAccountFoundFromPayId = true;
		} else {
			isAccountFoundFromPayId = false;
		}

		loader = false;
	};

	$effect(() => {
		payId = sanitizePayId(payId);
		const id = setTimeout(getAccountFromPayId, 500); // debounce

		return () => {
			clearTimeout(id);
		};
	});

	$effect(() => {
		try {
			let decodedAccount = decodeIcrcAccount(account);
			icrcAccount = {
				owner: decodedAccount.owner,
				subaccount: decodedAccount.subaccount ? [decodedAccount.subaccount] : []
			};

			enableAccountError = false;
		} catch (error) {
			console.error(error);
			enableAccountError = true;
		}
	});

	const onclick = async () => {
		buttonLoader = true;
		await transferCkBTC({
			amount: amount ?? 0,
			to: icrcAccount,
			note: note.length > 0 ? note : undefined
		});
		buttonLoader = false;
	};
</script>

<a href="/business"><ArrowLeft class="left-5 top-5" /></a>

<h2 class="text-center text-2xl">Transfer ckBTC</h2>

<div class="grid w-full items-center gap-1.5">
	<Label for="transferType">Transfer to</Label>
	<Select.Root type="single" name="favoriteFruit" bind:value>
		<Select.Trigger id="transferType">
			{triggerContent}
		</Select.Trigger>
		<Select.Content>
			{#each transferType as type}
				<Select.Item value={type.value} label={type.value} />
			{/each}
		</Select.Content>
	</Select.Root>
</div>

{#if value === 'Pay Id'}
	<div class="grid w-full items-center gap-1.5">
		<Label for="payid">Receiving Pay ID</Label>
		<div class="relative">
			<input
				bind:value={payId}
				type="text"
				id="payid"
				placeholder="Pay ID"
				class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
				required
				onchange={() => (isPayIdTouched = true)}
			/>
			<div class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
				{#if loader}
					<Loader class="animate-spin" size={20} />
				{:else if isAccountFoundFromPayId}
					<CircleCheck class="text-green-500" size={20} />
				{:else}
					<X size={20} onclick={clearPayId} class="hover:cursor-pointer" />
				{/if}
			</div>
		</div>

		{#if enablePayIdError && isPayIdTouched && !loader}
			<div class="flex items-center text-red-500" transition:slide={{ duration: 200 }}>
				<CircleAlert size={16} />
				<p class="ml-1 text-xs">Invalid Pay ID</p>
			</div>
		{/if}
	</div>
{:else if value === 'Account'}
	<div class="grid w-full items-center gap-1.5">
		<Label for="account">Receiving Account</Label>
		<div class="relative">
			<input
				bind:value={account}
				type="text"
				id="account"
				placeholder="Account"
				class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
				required
				onchange={() => (isAccountTouched = true)}
			/>

			<div
				class="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center gap-3 text-gray-500"
			>
				<QrCodeScanModel bind:value={account} onScanSuccess={() => (isAccountTouched = true)} />
			</div>
		</div>

		{#if enableAccountError && isAccountTouched}
			<div class="flex items-center text-red-500" transition:slide={{ duration: 200 }}>
				<CircleAlert size={16} />
				<p class="ml-1 text-xs">Invalid Accound</p>
			</div>
		{/if}
	</div>
{/if}

<div class="flex w-full flex-col gap-1.5">
	<Label for="amount">Amount</Label>
	<div class="relative">
		<input
			bind:value={amount}
			type="number"
			id="amount"
			min="0"
			placeholder="Amount"
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
		Balance: <span class="font-medium">{balance.value} ckBTC</span>
	</p>

	{#if enableAmountError && isAmountTouched}
		<div class="flex items-center text-red-500" transition:slide={{ duration: 200 }}>
			<CircleAlert class="inline" size={15} />
			<p class="ml-1 text-xs">Please enter an amount no higher than your available balance.</p>
		</div>
	{/if}
</div>

<div class="flex justify-center">
	<Notearea bind:value={note} />
</div>

<ButtonWithLoader {disabled} loader={buttonLoader} {onclick}>Transfer</ButtonWithLoader>

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
