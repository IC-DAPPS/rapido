<script lang="ts">
	let { children } = $props();
</script>

<div class="flex h-full justify-center">
	<div class="flex h-auto w-full max-w-xl flex-col gap-4 p-5">
		{@render children()}
	</div>
</div>
