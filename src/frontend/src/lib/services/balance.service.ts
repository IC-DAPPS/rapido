import { balance } from '$lib/api/ck-btc-index.api';
import { DIVISOR, FETCH_BALANCE_INTERVAL } from '@constants/app.constants';
import { nonNullish } from '@dfinity/utils';
import { setBalance } from '@states/balance.svelte';
import { authStore } from '@stores/auth.store';
import { toast } from 'svelte-sonner';
import { get } from 'svelte/store';

export const fetchBalance = async () => {
	console.log('fetchBalance');
	let { identity } = get(authStore);
	let value = 0;
	let bigInt = BigInt(0);
	try {
		if (nonNullish(identity)) {
			bigInt = await balance({
				identity,
				owner: identity.getPrincipal(),
				certified: false
			});
			value = Number(bigInt) / DIVISOR;
		}

		setBalance(value, bigInt);
	} catch (error) {
		console.error(error);

		toast.error('Something went wrong while fetching balance.');
	}
};

let timerId: NodeJS.Timeout;
export const startAutoBalanceFetch = () => {
	timerId = setInterval(fetchBalance, FETCH_BALANCE_INTERVAL);
};

export const stopAutoBalanceFetch = () => {
	clearInterval(timerId);
};
