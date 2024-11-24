<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { CircleAlert, CircleCheck, Loader, X } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import ButtonWithLoader from '$lib/ButtonWithLoader/ButtonWithLoader.svelte';
	import BusinessCategorySelect from '@components/SignUp/BusinessCategorySelect.svelte';
	import type { BusinessCategory } from '@declarations/backend/backend.did';
	import { isPayIdAvailableSearch, signUpBusiness } from '@services/signup.service';
	import { nonNullish } from '@dfinity/utils';
	import type { ResultSuccess } from '$lib/types/utils';
	import { sanitizePayId } from '@utils/payId.utils';

	let { resultSuccess }: { resultSuccess: (result: ResultSuccess) => void } = $props();

	let businsesCatergory: BusinessCategory | undefined = $state();

	let name: string = $state('');
	let payId: string = $state('');

	let isPayIdAvail = $state<boolean>(false);
	let loader = $state(false);

	let enableNameError = $derived(name.length < 2);
	let enablePayIdError = $derived.by(() => {
		if (payId === '') return true;

		return !isPayIdAvail;
	});

	let buttonDisable = $derived(
		enableNameError || enablePayIdError || loader || businsesCatergory === undefined
	);

	const searchPayIdIsAvailable = async () => {
		if (payId.length < 3) return;

		loader = true;
		isPayIdAvail = await isPayIdAvailableSearch(payId);
		console.log(isPayIdAvail);
		loader = false;
	};

	const clearPayId = () => {
		payId = '';
	};

	const getPayIdErrorMessage = () => {
		if (payId === '') return 'Choose a PayId to continue';

		if (!isPayIdAvail) return 'Pay Id is not available';
	};

	$effect(() => {
		payId = sanitizePayId(payId);
		const id = setTimeout(searchPayIdIsAvailable, 500); // debounce

		if (payId.length < 3) {
			isPayIdAvail = false;
		}

		return () => {
			clearTimeout(id);
		};
	});

	$effect(() => {
		// Remove leading whitespace
		name = name.replace(/^\s+/, '');
	});

	let isNameTouched = $state(false);
	let isPayIdTouched = $state(false);

	let buttonLoader = $state(false);

	async function onclick() {
		buttonLoader = true;

		if (nonNullish(businsesCatergory)) {
			const result = await signUpBusiness({ name, payId, category: businsesCatergory });
			resultSuccess(result);
		}

		buttonLoader = false;
	}
</script>

<BusinessCategorySelect bind:value={businsesCatergory} />

<div class="grid w-full items-center gap-1.5">
	<Label for="name">Name</Label>
	<Input
		bind:value={name}
		type="text"
		id="name"
		placeholder="Full Name"
		required
		onchange={() => (isNameTouched = true)}
	/>

	{#if enableNameError && isNameTouched}
		<div class="flex items-center text-red-500" transition:slide|local={{ duration: 200 }}>
			<CircleAlert size={15} />
			<p class="ml-1 text-xs">Required field. Minimum three characters.</p>
		</div>
	{/if}
</div>

<div class="grid w-full items-center gap-1.5">
	<label for="payid" class="text-sm font-medium leading-none">Unique Pay ID</label>
	<div class="relative">
		<input
			bind:value={payId}
			type="text"
			id="payid"
			placeholder="example-101"
			class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
			required
			onchange={() => (isPayIdTouched = true)}
		/>
		<div class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
			{#if loader}
				<Loader class="animate-spin" size={18} />
			{:else if isPayIdAvail}
				<CircleCheck class="text-green-500" size={18} />
			{:else}
				<X size={18} onclick={clearPayId} class="hover:cursor-pointer" />
			{/if}
		</div>
	</div>

	{#if enablePayIdError && isPayIdTouched && !loader}
		<div class="flex items-center text-red-500" transition:slide={{ duration: 200 }}>
			<CircleAlert size={16} />
			<p class="ml-1 text-xs">{getPayIdErrorMessage()}</p>
		</div>
	{/if}
</div>

<ButtonWithLoader loader={buttonLoader} disabled={buttonDisable} {onclick}
	>Create Account</ButtonWithLoader
>
