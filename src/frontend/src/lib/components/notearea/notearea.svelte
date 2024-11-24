<script lang="ts">
	import type { WithElementRef, WithoutChildren } from 'bits-ui';
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		...restProps
	}: WithoutChildren<WithElementRef<HTMLTextareaAttributes>> = $props();

	/**
	 *  additions attributes
	 * 	id="note"maxlength={80} minlength={0} placeholder="Add note"
	 */
</script>

<textarea
	bind:this={ref}
	bind:value
	id="note"
	maxlength={80}
	minlength={0}
	placeholder="Add note"
	class={cn(
		'"flex disabled:opacity-50" rounded-md border border-input bg-transparent px-5 py-2 text-center text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed',
		className
	)}
	{...restProps}
></textarea>

<style>
	/* My additional are only styles, removed some classes and implemented alternatives styles here */
	textarea {
		/* for dynamic resizing */
		field-sizing: content;

		/* for controlling growing and shrinking of textarea */
		min-width: 100px;
		max-width: 292px;
		min-height: 36px;
		width: fit-content;

		/* for hidding resize icon in textarea */
		resize: none;
	}
</style>
