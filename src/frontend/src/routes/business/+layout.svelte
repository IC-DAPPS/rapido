<script lang="ts">
	import {
		fetchBalance,
		startAutoBalanceFetch,
		stopAutoBalanceFetch
	} from '@services/balance.service';
	import { balance } from '@states/balance.svelte';
	import { onDestroy, onMount } from 'svelte';

	let { children } = $props();

	onMount(async () => {
		await fetchBalance();

		startAutoBalanceFetch();
	});

	onDestroy(() => {
		stopAutoBalanceFetch();
	});

	$inspect(balance);
</script>

<div class="flex h-full justify-center">
	<div class="flex h-auto w-full max-w-xl flex-col gap-4 p-5">
		{@render children()}
	</div>
</div>
