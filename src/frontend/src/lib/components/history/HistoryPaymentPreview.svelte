<script lang="ts">
	import { DIVISOR } from '@constants/app.constants';
	import type { TransactionEntry } from '@declarations/backend/backend.did';
	import { formatNanosecTimestamp } from '@utils/date.utils';

	let { transaction }: { transaction: TransactionEntry } = $props();
</script>

<div class="flex items-center justify-between">
	<div class="min-w-0">
		<p class="w-full truncate font-medium">
			{transaction.name}
		</p>
		<p class="text-sm font-light text-muted-foreground">
			{formatNanosecTimestamp(Number(transaction.timestamp))}
		</p>
	</div>

	{#if 'Receive' in transaction.kind}
		<p class="ml-2 shrink-0 font-medium text-primary">↓ {Number(transaction.amount) / DIVISOR}</p>
	{:else}
		<p class="ml-2 shrink-0 font-medium">↑ {Number(transaction.amount) / DIVISOR}</p>
	{/if}
</div>
