<script lang="ts">
	import type { AppUserCategoryKey } from '$lib/types/states';
	import {
		BookOpenText,
		Bot,
		CarTaxiFront,
		Factory,
		HandPlatter,
		Handshake,
		HardHat,
		HeartPulse,
		Landmark,
		MapPinHouse,
		RollerCoaster,
		ShieldEllipsis,
		ShieldQuestion,
		Sprout,
		Store,
		User,
		Utensils,
		Zap
	} from 'lucide-svelte';

	let {
		category = 'NONE'
	}: {
		category?: AppUserCategoryKey;
	} = $props();
</script>

{#if category === 'USER'}
	<User class="h-7 w-7" />
{:else if category === 'Healthcare'}
	<HeartPulse class="h-7 w-7" />
{:else if category === 'RealEstate'}
	<MapPinHouse class="h-7 w-7" />
{:else if category === 'Food'}
	<Utensils class="h-7 w-7" />
{:else if category === 'Energy'}
	<Zap class="h-7 w-7" />
{:else if category === 'Retail'}
	<Store class="h-7 w-7" />
{:else if category === 'Professional'}
	<Handshake class="h-7 w-7" />
{:else if category === 'Technology'}
	<Bot class="h-7 w-7" />
{:else if category === 'Entertainment'}
	<RollerCoaster class="h-7 w-7" />
{:else if category === 'Transportation'}
	<CarTaxiFront class="h-7 w-7" />
{:else if category === 'Agriculture'}
	<Sprout class="h-7 w-7" />
{:else if category === 'Education'}
	<BookOpenText class="h-7 w-7" />
{:else if category === 'Finance'}
	<Landmark class="h-7 w-7" />
{:else if category === 'Hospitality'}
	<HandPlatter class="h-7 w-7" />
{:else if category === 'Construction'}
	<HardHat class="h-7 w-7" />
{:else if category === 'Manufacturing'}
	<Factory class="h-7 w-7" />
{:else if category === 'Other'}
	<ShieldEllipsis class="h-7 w-7" />
{:else}
	<ShieldQuestion class="h-7 w-7" />
{/if}
