<script lang="ts">
	let { children } = $props();
	import {
		fetchBalance,
		startAutoBalanceFetch,
		stopAutoBalanceFetch
	} from '@services/balance.service';
	import { onDestroy, onMount } from 'svelte';

	onMount(async () => {
		await fetchBalance();

		startAutoBalanceFetch();
	});

	onDestroy(() => {
		stopAutoBalanceFetch();
	});
</script>

<div class="flex h-full justify-center">
	<div class="flex h-auto w-full max-w-xl flex-col gap-4 p-5">
		{@render children()}
	</div>
</div>
