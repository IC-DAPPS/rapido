<script>
	import Avatar from '@components/Avatar/Avatar.svelte';
	import TransactionEntryShort from '@components/history/TransactionEntryShort.svelte';
	import { balance } from '@states/balance.svelte';
	import { transaction } from '@states/history.svelte';
	import { formatNanosecTimestampWithYear } from '@utils/date.utils';
	import { ArrowLeft } from 'lucide-svelte';
</script>

<a href="/business"><ArrowLeft class="left-5 top-5" /></a>
<h2 class="text-center text-2xl">Payments</h2>

<p class="text-muted-foreground">Balance</p>
<div class="flex items-center gap-1">
	<img src="/logo/token/ckbtc.svg" class="mr-1 h-7 w-7" alt="ckBTC logo" />
	<h3 class="text-3xl">
		{balance.value} <span class=" text-base text-primary md:text-lg">ckBTC</span>
	</h3>
</div>

<hr class="mt-5 h-px w-full border-0 bg-gray-200 dark:bg-gray-700" />

<!-- <div class="flex items-center justify-between">
	<div class="flex items-center">
		<Avatar name="Shadcn" src="https://github.com/shadcn.png" class="mr-5" />

		<div>
			<p class="font-medium">Ahammed R</p>
			<p class="text-sm text-muted-foreground">
				{formatNanosecTimestampWithYear(new Date().getTime() * 1e6)}
			</p>
		</div>
	</div>
	<p class="font-medium text-primary">↓ 0.00823888</p>
</div>

<div class="flex items-center justify-between">
	<div class="flex items-center">
		<Avatar name="Shadcn" src="https://github.com/shadcn.png" class="mr-5" />

		<div>
			<p class="font-medium">ljwhn-wbjou-627it-kn</p>
			<p class="text-sm text-muted-foreground">
				{formatNanosecTimestampWithYear(new Date().getTime() * 1e6)}
			</p>
		</div>
	</div>
	<p class="font-medium">↑ 0.00823888</p>
</div> -->

{#each transaction.history as txEntry (txEntry)}
	<TransactionEntryShort {txEntry} />
{/each}
