<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { ButtonVariant } from '@components/ui/button/button.svelte';
	import type { Snippet } from 'svelte';
	import { Loader } from 'lucide-svelte';
	import { fly } from 'svelte/transition';
	import { twMerge } from 'tailwind-merge';

	let {
		disabled,
		loader,
		onclick,
		variant = 'default',
		children,
		...props
	}: {
		disabled?: boolean;
		loader: boolean;
		onclick?: () => void | Promise<void>;
		variant: ButtonVariant;
		class?: string;
		loaderClass?: string;
		children: Snippet;
	} = $props();
</script>

<Button
	class={twMerge(
		`disabled:cursor-not-allowed ${loader ? 'disabled:opacity-100' : ''}`,
		props.class
	)}
	disabled={disabled || loader}
	{onclick}
	{variant}
>
	{#if loader}
		<div
			in:fly={{ delay: 300, duration: 300, x: -50, opacity: 0 }}
			out:fly={{ duration: 200, x: -50, opacity: 0 }}
		>
			<Loader class={twMerge('h-7 w-7 animate-spin', props.loaderClass)} />
		</div>
	{:else}
		<div
			in:fly={{ delay: 200, duration: 300, x: 50, opacity: 0 }}
			out:fly={{ duration: 200, x: 50, opacity: 0 }}
		>
			{@render children()}
		</div>
	{/if}
</Button>
