<script lang="ts">
	import Avatar from '@components/Avatar/Avatar.svelte';
	import QrCodeGenerator from '@components/QrCode/QrCodeGenerator.svelte';
	import { ArrowLeft, Store } from 'lucide-svelte';
	import LightningBolt from 'svelte-radix/LightningBolt.svelte';
</script>

<a href="/business"><ArrowLeft class="left-5 top-5" /></a>

<div class=" flex flex-col items-center justify-center text-center">
	<p class="text-xs font-light text-muted-foreground">Powered by</p>
	<div class="flex items-center"><LightningBolt /> <span class="ml-0.5 text-2xl">Pay</span></div>
</div>

<p class="text-center text-base">Scan & Pay</p>
<QrCodeGenerator
	value={'dwx4w-plydf-jxgs5-uncbu-mfyds-5vjzm-oohax-gmvja-cypv7-tmbt4-dqe'}
	ariaLabel="QR code"
	size={200}
	radius={0}
	ecLevel={'M'}
	>{#snippet logo()}
		<!-- <img src="/logo/token/ckbtc.svg" alt="logo" class="h-10 w-10" /> -->
		<Avatar src="https://github.com/shadc" name="shadcn" />
	{/snippet}</QrCodeGenerator
>
<div class="flex flex-col items-center gap-0.5">
	<Store class="h-7 w-7" />
	<h2 class="text-center text-2xl">The Grocery Store</h2>
	<p class="text-center text-muted-foreground">PAY ID: {'the-grocery--store'}</p>
</div>

<div class="absolute inset-x-0 bottom-0">
	<div class="mb-5 flex flex-col items-center gap-0.5">
		<hr class="my-5 h-px w-full border-0 bg-gray-200 dark:bg-gray-700" />
		<p class="text-xs font-light text-muted-foreground">Pay using ckBTC</p>
		<img src="/logo/token/ckbtc.svg" alt="ckbtc logo" class="mt-2 h-10 w-10" />
	</div>
</div>
