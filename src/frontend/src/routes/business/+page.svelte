<script lang="ts">
	import HistoryPaymentPreview from '@components/history/HistoryPaymentPreview.svelte';
	import PaymentHistoryPreviewPlaceholder from '@components/history/PaymentHistoryPreviewPlaceholder.svelte';
	import Button from '@components/ui/button/button.svelte';
	import * as Tabs from '@components/ui/tabs/index';
	import { DIVISOR } from '@constants/app.constants';
	import type { TransactionEntry } from '@declarations/backend/backend.did';
	import { balance } from '@states/balance.svelte';
	import { transaction } from '@states/history.svelte';
	import {
		get30DaysMidnightTimestamp,
		getLastSevenDaysMidnightTimestamp,
		getTodayMidnightTimestamp
	} from '@utils/date.utils';
	import { ArrowDownToLine, ArrowLeftRight, Download, QrCode, Upload } from 'lucide-svelte';

	type Duration = 'today' | '7days' | '30days';

	let value: Duration = $state('today');

	let today = $derived.by(() => {
		// getTodayMidnightTimestamp returns timestamp in milliseconds this need to be compared with nanoseconds
		let midnight = BigInt(getTodayMidnightTimestamp() * 1_000_000);

		const todaysTx: TransactionEntry[] = [];
		let todayReceived = BigInt(0);

		transaction.history.every((tx) => {
			if (tx.timestamp >= midnight) {
				todaysTx.push(tx);
				if ('Receive' in tx.kind) {
					todayReceived += tx.amount;
				}

				return true; // to continue
			} else {
				return false; // to break
			}
		});

		return {
			received: Number(todayReceived) / DIVISOR,
			history: todaysTx
		};
	});

	let sevendays = $derived.by(() => {
		// getTodayMidnightTimestamp returns timestamp in milliseconds this need to be compared with nanoseconds
		let sevendayMidnight = BigInt(getLastSevenDaysMidnightTimestamp() * 1_000_000);

		const sevendayTx: TransactionEntry[] = [];
		let sevendayReceived = BigInt(0);

		transaction.history.every((tx) => {
			if (tx.timestamp >= sevendayMidnight) {
				sevendayTx.push(tx);
				if ('Receive' in tx.kind) {
					sevendayReceived += tx.amount;
				}

				return true; // to continue
			} else {
				return false; // to break
			}
		});

		return {
			received: Number(sevendayReceived) / DIVISOR,
			history: sevendayTx
		};
	});

	let thirtydays = $derived.by(() => {
		// getTodayMidnightTimestamp returns timestamp in milliseconds this need to be compared with nanoseconds
		let thirtydaysMidnight = BigInt(get30DaysMidnightTimestamp() * 1_000_000);

		const thirtydaysTx: TransactionEntry[] = [];
		let todayReceived = BigInt(0);

		transaction.history.every((tx) => {
			if (tx.timestamp >= thirtydaysMidnight) {
				thirtydaysTx.push(tx);
				if ('Receive' in tx.kind) {
					todayReceived += tx.amount;
				}

				return true; // to continue
			} else {
				return false; // to break
			}
		});

		return {
			received: Number(todayReceived) / DIVISOR,
			history: thirtydaysTx
		};
	});
</script>

<!-- <h2>Business Page</h2> -->
<!-- <div class="flex justify-center">
	<img src="/logo/token/ckbtc.svg" class="mr-3 h-8 w-8" alt="ckBTC logo" /> -->
<h2 class="text-center text-2xl md:text-4xl">
	{balance.value} <span class="text-lg text-primary md:text-xl">ckBTC</span>
</h2>
<!-- </div> -->
<div class="flex justify-between">
	<a href="business/qrcode" class="w-fit rounded p-2 hover:bg-accent hover:text-accent-foreground">
		<div class="flex w-[68px] flex-col items-center gap-2">
			<QrCode size={30} />
			<p class="text-center">QR Code</p>
		</div>
	</a>
	<a href="business/deposit" class="w-fit rounded p-2 hover:bg-accent hover:text-accent-foreground">
		<div class="flex w-[68px] flex-col items-center gap-2">
			<Download size={30} />
			<p class="text-center">Deposit</p>
		</div>
	</a>
	<a
		href="business/withdraw"
		class="w-fit rounded p-2 hover:bg-accent hover:text-accent-foreground"
	>
		<div class="flex w-[68px] flex-col items-center gap-2">
			<Upload size={30} />
			<p class="text-center">Withdraw</p>
		</div>
	</a>
	<a
		href="business/transfer"
		class="w-fit rounded p-2 hover:bg-accent hover:text-accent-foreground"
	>
		<div class="flex w-[68px] flex-col items-center gap-2">
			<ArrowLeftRight size={30} />
			<p class="text-center">Transfer</p>
		</div>
	</a>
</div>

<div class="flex justify-between">
	<div class="">
		<div class="flex items-center">
			<img src="/logo/token/ckbtc.svg" class="mr-1 h-6 w-6" alt="ckBTC logo" />

			{#if value === 'today'}
				<h3 class="text-2xl font-semibold">{today.received}</h3>
			{:else if value === '7days'}
				<h3 class="text-2xl font-semibold">{sevendays.received}</h3>
			{:else}
				<h3 class="text-2xl font-semibold">{thirtydays.received}</h3>
			{/if}
		</div>

		{#if value === 'today'}
			<p class="mt-3 text-sm text-muted-foreground">Received Today</p>
		{:else if value === '7days'}
			<p class="mt-3 text-sm text-muted-foreground">Received in the last 7 days</p>
		{:else}
			<p class="mt-3 text-sm text-muted-foreground">Received in the last 30 days</p>
		{/if}
	</div>

	<Tabs.Root bind:value>
		<Tabs.List>
			<Tabs.Trigger value={'today' as Duration}>1D</Tabs.Trigger>
			<Tabs.Trigger value={'7days' as Duration}>7D</Tabs.Trigger>
			<Tabs.Trigger value={'30days' as Duration}>1M</Tabs.Trigger>
		</Tabs.List>
	</Tabs.Root>
</div>

{#if value === 'today'}
	{#if today.history.length > 0}
		<HistoryPaymentPreview transaction={today.history[0]} />
	{:else}
		<PaymentHistoryPreviewPlaceholder />
	{/if}

	{#if today.history.length > 1}
		<HistoryPaymentPreview transaction={today.history[1]} />
	{/if}
{:else if value === '7days'}
	{#if sevendays.history.length > 0}
		<HistoryPaymentPreview transaction={sevendays.history[0]} />
	{:else}
		<PaymentHistoryPreviewPlaceholder />
	{/if}

	{#if sevendays.history.length > 1}
		<HistoryPaymentPreview transaction={sevendays.history[1]} />
	{/if}
{:else}
	{#if thirtydays.history.length > 0}
		<HistoryPaymentPreview transaction={thirtydays.history[0]} />
	{:else}
		<PaymentHistoryPreviewPlaceholder />
	{/if}

	{#if thirtydays.history.length > 1}
		<HistoryPaymentPreview transaction={thirtydays.history[1]} />
	{/if}
{/if}

<!-- <div class="flex items-center justify-between">
	<div>
		<p class="font-medium">John Doe</p>
		<p class="text-sm font-light text-muted-foreground">Nov 26, 10:41 AM</p>
	</div>

	<p class="font-medium text-primary">↓ 0.00823888</p>
</div>

<div class="flex items-center justify-between">
	<div>
		<p class="font-medium">ljwhn-wbjou-627it-kn</p>
		<p class="text-sm font-light text-muted-foreground">Nov 26, 10:41 AM</p>
	</div>

	<p class="font-medium text-primary">↓ 0.00823888</p>
</div> -->

<div class="flex justify-center">
	<Button class="w-fit px-5" href="business/payments">View all payments</Button>
</div>
