<script lang="ts">
	import type { TransactionEntry } from '@declarations/backend/backend.did';
	import Avatar from '@components/Avatar/Avatar.svelte';
	import { formatNanosecTimestampWithYear } from '@utils/date.utils';
	import { DIVISOR } from '@constants/app.constants';

	let { txEntry }: { txEntry: TransactionEntry } = $props();
</script>

<div class="flex items-center justify-between">
	<div class="flex min-w-0 items-center">
		<Avatar name={txEntry.name} src="" class="mr-5 shrink-0" />

		<div class="min-w-0 flex-1">
			<p class="w-full truncate font-medium">{txEntry.name}</p>
			<p class="w-full truncate text-sm text-muted-foreground">
				{formatNanosecTimestampWithYear(Number(txEntry.timestamp))}
			</p>
		</div>
	</div>

	<!-- converting from decimals 8 -->
	{#if 'Receive' in txEntry.kind}
		<p class="ml-1 shrink-0 font-medium text-primary">↓ {Number(txEntry.amount) / DIVISOR}</p>
	{:else}
		<p class="ml-1 shrink-0 font-medium">↑ {Number(txEntry.amount) / DIVISOR}</p>
	{/if}
</div>
