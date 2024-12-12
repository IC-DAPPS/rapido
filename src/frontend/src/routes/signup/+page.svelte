<script lang="ts">
	import LightningBolt from 'svelte-radix/LightningBolt.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import IndividualForm from '@components/SignUp/IndividualForm.svelte';
	import BusinessForm from '@components/SignUp/BusinessForm.svelte';
	import type { ResultSuccess } from '$lib/types/utils';
	import { goto } from '$app/navigation';
	import { navigation } from '@utils/navigation.utils';
	import { authStore } from '@stores/auth.store';

	const accountTypes: { value: 'Individual' | 'Business' }[] = [
		{ value: 'Individual' },
		{ value: 'Business' }
	];

	let value = $state<'Individual' | 'Business'>();

	const triggerContent = $derived(
		accountTypes.find((f) => f.value === value)?.value ?? 'Choose Your Account Type'
	);
</script>

<div class="flex items-center"><LightningBolt /> <span class="ml-0.5 text-2xl">Pay</span></div>

<h2 class="text-3xl">Welcome to Rapido Pay</h2>

<p class="text-muted-foreground">Are you signing up as a business or an individual?</p>

<Select.Root type="single" name="accountType" bind:value>
	<Select.Trigger>
		{triggerContent}
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			<Select.GroupHeading class="text-base">Account Type</Select.GroupHeading>
			{#each accountTypes as acc}
				<Select.Item class="text-base" value={acc.value} label={acc.value} />
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>

{#if value === 'Individual'}
	<IndividualForm
		resultSuccess={async (result: ResultSuccess) => {
			if (result.success) {
				goto('/user');
			}
		}}
	/>
{:else if value === 'Business'}
	<BusinessForm
		resultSuccess={async (result: ResultSuccess) => {
			if (result.success) {
				await navigation($authStore?.identity);
			}
		}}
	/>
{/if}
