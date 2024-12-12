<script lang="ts">
	import DarkModeToggle from '@components/DarkMode/DarkModeToggle.svelte';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { onDestroy, onMount } from 'svelte';
	import { authStore } from '@stores/auth.store';
	import { i18n } from '@stores/i18n.store';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { navigation } from '@utils/navigation.utils';
	import { goto } from '$app/navigation';
	import AuthButton from '@components/AuthButton/AuthButton.svelte';
	let { children } = $props();

	onMount(async () => {
		await authStore.sync();
		await i18n.init();
	});

	authStore.subscribe(async ({ identity }) => {
		if (identity) {
			await navigation(identity);
		} else {
			goto('/');
		}
	});
</script>

<ModeWatcher />
<Toaster />
<!-- <div class="flex justify-between">
	<DarkModeToggle />
	<AuthButton></AuthButton>
</div> -->
{@render children()}
