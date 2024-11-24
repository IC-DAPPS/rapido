import { getAccountFromPayId } from '$lib/api/backend.api';
import type { Option } from '$lib/types/utils';
import type { Account } from '@dfinity/ckbtc';
import { isNullish } from '@dfinity/utils';
import { authStore } from '@stores/auth.store';
import { toast } from 'svelte-sonner';
import { get } from 'svelte/store';

let toastId: string | number;
export const getAccountFromPayIdService = async (payId: string): Promise<Option<Account>> => {
	try {
		const { identity } = get(authStore);
		if (isNullish(identity)) {
			toastId = toast.info('Please authenticate with Internet Identity', {
				id: toastId
			});
			return null;
		}

		const optPrincipal = await getAccountFromPayId({ identity, payId });

		if (optPrincipal[0]) {
			return { owner: optPrincipal[0], subaccount: [] } as Account;
		} else {
			// Annoying Toast in debounce
			// toastId = toast.info('Account not found', {
			// 	id: toastId
			// });
			return null;
		}
	} catch (error) {
		console.error(error);
		toastId = toast.info('Something went wrong while searching Account', {
			id: toastId
		});

		return null;
	}
};
