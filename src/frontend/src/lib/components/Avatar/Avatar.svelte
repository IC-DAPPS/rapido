<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';

	let { name, src }: { name: string; src: string } = $props();
	//"https://github.com/shadcn.png"
</script>

<Avatar.Root>
	<Avatar.Image {src} alt="@shadcn" />
	<Avatar.Fallback>{name.substring(0, 2).toUpperCase()}</Avatar.Fallback>
</Avatar.Root>
