<script>
	import { authStore } from '$lib/stores/auth.store';
	import Button from '@components/ui/button/button.svelte';

	function handleSignIn() {
		console.log('sign in initiated');
		try {
			authStore.signIn({ domain: 'internetcomputer.org' });
		} catch (error) {
			console.error('Sign in error:', error);
		}
	}
</script>

<div>
	{#if $authStore.identity}
		<Button onclick={authStore.signOut}>SignOut</Button>
	{:else}
		<Button onclick={handleSignIn}>SignIn</Button>
	{/if}
</div>

<style>
	/* button {
		padding: 10px 20px;
		margin: 10px auto;
		font-size: larger;
	} */

	div {
		display: flex;
		justify-content: center;
	}
</style>
