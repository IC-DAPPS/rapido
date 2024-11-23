<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Button from '@components/ui/button/button.svelte';
	import { balance } from '@states/balance.svelte';
	import { onMount } from 'svelte';
	import { getMinterInfo } from '$lib/api/ck-btc-minter.api';
	import { authStore } from '@stores/auth.store';

	onMount(async () => {
		const { identity } = $authStore;
		console.log(await getMinterInfo({ identity, certified: false }));
	});
</script>

<a href="/business"><ArrowLeft class="left-5 top-5" /></a>

<p class="text-center text-2xl">Withdraw Bitcoin</p>

<div class="flex w-full max-w-sm flex-col gap-1.5">
	<Label for="btc-address">Bitcoin Receiving Address</Label>
	<Input type="text" id="btc-address" placeholder="Enter you address" />
</div>

<div class="flex w-full max-w-sm flex-col gap-1.5">
	<Label for="Amount">Amount</Label>
	<Input type="number" id="amount" placeholder="0.0" />
	<p class="text-sm text-muted-foreground">Balance: {balance.value}</p>
</div>

<Button>Withdraw</Button>
