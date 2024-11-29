<script lang="ts">
	import { DIVISOR } from '@constants/app.constants';
	import type { TransactionEntry } from '@declarations/backend/backend.did';
	import { formatNanosecTimestamp } from '@utils/date.utils';

	let { transaction }: { transaction: TransactionEntry } = $props();
</script>

<div class="flex items-center justify-between">
	<div>
		<p class="font-medium">{transaction.name}</p>
		<p class="text-sm font-light text-muted-foreground">
			{formatNanosecTimestamp(Number(transaction.timestamp))}
		</p>
	</div>

	<p class="font-medium text-primary">
		{#if 'Send' in transaction.kind}↑{:else}↓{/if}
		{Number(transaction.amount) / DIVISOR}
	</p>
</div>
