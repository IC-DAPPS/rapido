<script>
	import Button from '@components/ui/button/button.svelte';
	import { balance } from '@states/balance.svelte';
	import { ArrowLeftRight, Download, QrCode, Upload } from 'lucide-svelte';
</script>

<h2>Business Page</h2>

{balance.value} my balance

<div class="flex justify-between">
	<a href="business/qrcode" class="w-fit rounded p-2 hover:bg-accent hover:text-accent-foreground">
		<div class="flex w-[68px] flex-col items-center gap-2">
			<QrCode size={30} />
			<p class="text-center">Your QR Code</p>
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
