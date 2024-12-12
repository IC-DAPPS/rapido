<script lang="ts">
	import { ArrowLeft, CircleAlert, WalletCards } from 'lucide-svelte';
	import { Label } from '$lib/components/ui/label/index.js';
	import { balance } from '@states/balance.svelte';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import ButtonWithLoader from '$lib/ButtonWithLoader/ButtonWithLoader.svelte';
  import Notearea from '@components/notearea/notearea.svelte';

	onMount(async () => {
		// Any initialization logic
	});

	let payId = $state('');
	let amount: number | undefined = $state<number>();

	let isPayIdTouched = $state(false);
	let isAmountTouched = $state(false);

	let enablePayIdError = $derived(!/^[a-zA-Z0-9_]{3,16}$/.test(payId));

	let enableAmountError = $derived.by(() => {
		const currentAmount = amount ?? 0;
		return currentAmount <= 0 || currentAmount > balance.value;
	});

	let loader = $state(false);
	let disabled = $derived(enablePayIdError || enableAmountError);

	const getAmountErrorMessage = () => {
		const currentAmount = amount ?? 0;
		if (currentAmount <= 0) {
			return 'Please enter a valid amount';
		}

		if (currentAmount > balance.value) {
			return 'Please enter an amount no higher than your available balance.';
		}
	};

	const getPayIdErrorMessage = () => {
		if (enablePayIdError && isPayIdTouched) {
			return 'Invalid Pay ID. Use 3-16 alphanumeric characters or underscores.';
		}
		return '';
	};

	const onclick = async () => {
		loader = true;
		console.log(`Withdrawing ${amount} to ${payId}`);
		loader = false;
	};
</script>

<div class="container mx-auto max-w-md px-4 py-8">
	<a href="/dashboard" class="absolute left-4 top-4">
		<ArrowLeft />
	</a>

	<div class="space-y-6">
		<h2 class="text-center text-2xl font-bold flex items-center justify-center gap-2">
			<WalletCards size={30} />
			Pay To Pay ID
		</h2>

		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="pay-id">Pay ID</Label>
				<input
					bind:value={payId}
					type="text"
					id="pay-id"
					placeholder="Enter Pay ID"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
					required
					onchange={() => (isPayIdTouched = true)}
				/>

				{#if enablePayIdError && isPayIdTouched}
					<div class="text-red-500" transition:slide={{ duration: 200 }}>
						<p class="ml-1 text-xs">
							<CircleAlert class="inline mr-1" size={15} />
							{getPayIdErrorMessage()}
						</p>
					</div>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="amount">Amount</Label>
				<div class="relative">
					<input
						bind:value={amount}
						type="number"
						id="amount"
						placeholder="Enter amount"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-16 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						required
						onchange={() => (isAmountTouched = true)}
					/>
					{#if balance.value > 0}
						<div class="absolute right-3 top-1/2 -translate-y-1/2">
							<button
								class="text-sm text-primary underline hover:text-primary/80"
								onclick={() => (amount = balance.value)}>Max</button
							>
						</div>
					{/if}
				</div>

				<p class="text-sm text-muted-foreground">
					Available Balance: <span class="font-medium">{balance.value}</span>
				</p>

				{#if enableAmountError && isAmountTouched}
					<div class="text-red-500" transition:slide={{ duration: 200 }}>
						<p class="ml-1 text-xs">
							<CircleAlert class="inline mr-1" size={15} />
							{getAmountErrorMessage()}
						</p>
					</div>
				{/if}
			</div>

			<ButtonWithLoader {disabled} {loader} {onclick} class="w-full">
				Withdraw to Pay ID
			</ButtonWithLoader>
		</div>
	</div>
</div>

<style>
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	input[type='number'] {
		-moz-appearance: textfield;
	}
</style>