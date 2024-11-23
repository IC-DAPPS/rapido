<script>
	import { authStore } from '$lib/stores/auth.store';
	import Button from '@components/ui/button/button.svelte';
	import { signIn, signOut } from '@services/auth.service';
</script>

<div>
	{#if $authStore.identity}
		<Button onclick={signOut}>SignOut</Button>
	{:else}
		<Button
			onclick={async () => {
				signIn({ domain: 'ic0.app' });
			}}>SignIn</Button
		>
	{/if}
</div>

<style>
	div {
		display: flex;
		justify-content: center;
	}
</style>
