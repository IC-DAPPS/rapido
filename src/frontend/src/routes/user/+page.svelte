<script lang="ts">
	import { QrCode, ArrowLeftRight, Download, Upload, Plus } from 'lucide-svelte';
	import { user } from '@states/app-user.svelte';
	import { Button } from '@components/ui/button';
	import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
	import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
	import { ScanQrCode } from 'lucide-svelte';
	import QrCodeScanModel from '@components/QrCode/QrCodeScanModel.svelte';

	// Mock users data
	const mockUsers = Array.from({ length: 45 }, (_, i) => ({
		id: i + 1,
		name: `User ${i + 1}`,
		avatar: i % 5 === 0 ? '' : `https://api.dicebear.com/8.x/personas/svg?seed=${i}`,
		initial: `U${i + 1}`
	}));

	let address = $state('');
	let isAddressTouched = $state(false);
	let visibleUsers = $state(20);

	function handleShowMore() {
		visibleUsers = Math.min(visibleUsers + 10, mockUsers.length);
	}
</script>

<h2 class="mb-4 text-xl font-semibold">User Page</h2>

<div class="mb-6 flex justify-between">
	<a href="user/qrcode" class="w-fit rounded p-2 hover:bg-accent hover:text-accent-foreground">
		<div class="flex w-[68px] flex-col items-center gap-2">
			<QrCode size={30} />
			<p class="text-center">Your QR Code</p>
		</div>
	</a>

	<div class="w-fit rounded p-2 hover:bg-accent hover:text-accent-foreground">
		<div class="flex w-[68px] flex-col items-center gap-2">
			<QrCodeScanModel
				size={30}
				bind:value={address}
				onScanSuccess={() => (isAddressTouched = true)}
			/>
			<p class="text-center">Scan To Pay</p>
		</div>
	</div>

	<a href="user/payid" class="w-fit rounded p-2 hover:bg-accent hover:text-accent-foreground">
		<div class="flex w-[68px] flex-col items-center gap-2">
			<Upload size={30} />
			<p class="text-center">Pay To Pay ID</p>
		</div>
	</a>

	<a href="user/transfer" class="w-fit rounded p-2 hover:bg-accent hover:text-accent-foreground">
		<div class="flex w-[68px] flex-col items-center gap-2">
			<ArrowLeftRight size={30} />
			<p class="text-center">Transfer</p>
		</div>
	</a>
</div>

<div class="space-y-4">
	<h2 class="text-xl font-semibold">People</h2>
	<div class="grid grid-cols-4 gap-x-8 gap-y-6">
		{#each mockUsers.slice(0, visibleUsers) as user}
			<Button variant="ghost" class="flex h-auto flex-col items-center space-y-2 hover:bg-accent">
				<Avatar class="h-14 w-14">
					{#if user.avatar}
						<AvatarImage src={user.avatar} alt={user.name} />
					{:else}
						<AvatarFallback class="text-lg">{user.initial}</AvatarFallback>
					{/if}
				</Avatar>
				<span class="text-sm font-medium">{user.name}</span>
			</Button>
		{/each}

		{#if visibleUsers < mockUsers.length}
			<Popover>
				<PopoverTrigger>
					<Button variant="outline" class="flex h-14 w-14 items-center justify-center rounded-full">
						<Plus size={24} />
					</Button>
				</PopoverTrigger>
				<PopoverContent class="w-80">
					<div class="grid grid-cols-4 gap-4">
						{#each mockUsers.slice(visibleUsers) as user}
							<Button
								variant="ghost"
								class="flex h-auto flex-col items-center space-y-2 hover:bg-accent"
								onclick={handleShowMore}
							>
								<Avatar class="h-14 w-14">
									{#if user.avatar}
										<AvatarImage src={user.avatar} alt={user.name} />
									{:else}
										<AvatarFallback class="text-lg">{user.initial}</AvatarFallback>
									{/if}
								</Avatar>
								<span class="text-sm font-medium">{user.name}</span>
							</Button>
						{/each}
					</div>
				</PopoverContent>
			</Popover>
		{/if}
	</div>
</div>
