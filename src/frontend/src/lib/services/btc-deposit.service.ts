import { getBtcAddress, updateBalance } from '$lib/api/ck-btc-minter.api';
import { MinterNoNewUtxosError, type PendingUtxo, type UpdateBalanceOk } from '@dfinity/ckbtc';
import { btcDepositAddress } from '@states/btc-deposit-address.svelte';
import { authStore } from '@stores/auth.store';
import { toast } from 'svelte-sonner';
import { get } from 'svelte/store';

/**
 * Note: The owner of the address. If not provided, the caller will be use instead. For getting getBtcAddress and updateBalance
 */
export const fetchBTCDepositAddress = async () => {
	const { identity } = get(authStore);
	try {
		if (!identity) return;
		const address = await getBtcAddress({ identity });
		// set address to state rune
		btcDepositAddress.address = address;
	} catch (error) {
		console.error(error);
		toast.error('Something went wrong while fetching BTC deposit address.');
	}
};

// Todo: https://github.com/dfinity/nns-dapp/blob/9979071ed32321d8c61ac163067fafa60c3b0aee/frontend/src/lib/services/ckbtc-minter.services.ts#L143
export const updateCkBTCBalanceMinter = async (): Promise<{
	completed: UpdateBalanceOk;
	pending: PendingUtxo[];
}> => {
	const { identity } = get(authStore);
	const completedUtxos: UpdateBalanceOk = [];
	try {
		// The minter only returns pending UTXOs (as an error) if there are no
		// completed UTXOs. So we need to keep calling until it throws an error.
		// To avoid an infinite loop we stop after 3 attempts.
		for (let i = 0; i < 3; i++) {
			const updateBalanceOk = await updateBalance({ identity });
			completedUtxos.push(...updateBalanceOk);
		}

		if (completedUtxos.length > 0) {
			toast.success('Updated available ckBTC : New confirmed BTC.');
			// toastsSuccess({
			//   labelKey: "ckbtc.ckbtc_balance_updated",
			// });
		} else {
			toast.success('Updated available ckBTC : No new confirmed BTC.');
			// toastsSuccess({
			//   labelKey: "error__ckbtc.no_new_confirmed_btc",
			// });
		}
	} catch (error: unknown) {
		if (!(error instanceof MinterNoNewUtxosError)) {
			throw error;
		}

		// toastsError({
		// 	labelKey: "error__ckbtc.update_balance",
		// 	err,
		//   });

		toast.error('Sorry, the balance cannot be updated.');

		return { completed: completedUtxos, pending: error.pendingUtxos };
	}

	return { completed: completedUtxos, pending: [] };
};
