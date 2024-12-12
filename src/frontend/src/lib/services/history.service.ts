import { getNewBusinessTransactions } from '$lib/api/backend.api';
import { FETCH_INTERVAL } from '@constants/app.constants';
import { isNullish, nonNullish } from '@dfinity/utils';
import { transaction } from '@states/history.svelte';
import { authStore } from '@stores/auth.store';
import { toast } from 'svelte-sonner';
import { get } from 'svelte/store';

let toastId: string | number;

export const fetchNewBusinessTransactions = async () => {
	console.log('fetchNewBusinessTransactions');
	let { identity } = get(authStore);

	if (isNullish(identity)) return;

	let length = transaction.history.length;

	try {
		const newTransactions = await getNewBusinessTransactions({ identity, length: BigInt(length) });

		if (newTransactions.length > 0) {
			transaction.history = [...newTransactions, ...transaction.history];
		}
	} catch (error) {
		console.error(error);

		toastId = toast.error('Something went wrong while fetching new business transactions.', {
			id: toastId
		});
	}
};

let timerId: NodeJS.Timeout;
export const startAutoFetchNewBusinessTransactions = () => {
	timerId = setInterval(fetchNewBusinessTransactions, FETCH_INTERVAL);
};

export const stopAutoFetchNewBusinessTransactions = () => {
	clearInterval(timerId);
};
