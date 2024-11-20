<script lang="ts">
	import type { BusinessCategory } from '@declarations/backend/backend.did';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	let { value = $bindable() }: { value: BusinessCategory | undefined } = $props();
	let valueSelect = $state('');

	// Available categories
	const categories = [
		'Healthcare',
		'RealEstate',
		'Food',
		'Energy',
		'Retail',
		'Professional',
		'Technology',
		'Entertainment',
		'Transportation',
		'Agriculture',
		'Education',
		'Finance',
		'Hospitality',
		'Construction',
		'Manufacturing',
		'Other'
	] as const;

	$effect(() => {
		value = valueSelect === '' ? undefined : ({ [valueSelect]: null } as BusinessCategory);
	});

	const triggerContent = $derived(categories.find((e) => e === valueSelect) ?? 'Choose a Category');
</script>

<div class="grid w-full items-center gap-1.5">
	<Label for="businessCategory">Business Category</Label>

	<Select.Root type="single" name="accountType" bind:value={valueSelect}>
		<Select.Trigger id="businessCategory">
			{triggerContent}
		</Select.Trigger>

		<Select.Content>
			<Select.Group>
				<Select.GroupHeading class="text-base">Business Category</Select.GroupHeading>
				{#each categories as category}
					<Select.Item class="text-base" value={category} label={category} />
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>
</div>
