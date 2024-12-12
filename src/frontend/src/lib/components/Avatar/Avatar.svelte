<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';

	let { name, src, class: className }: { name: string; src: string; class?: string } = $props();
	//"https://github.com/shadcn.png"
</script>

<Avatar.Root class={className}>
	<Avatar.Image {src} alt="@shadcn" />
	<Avatar.Fallback>{name.substring(0, 2).toUpperCase()}</Avatar.Fallback>
</Avatar.Root>
