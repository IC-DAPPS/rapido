import { recordTransferTransaction } from '$lib/api/backend.api';
import { transfer } from '$lib/api/ck-btc-ledger.api';
import { DIVISOR } from '@constants/app.constants';
import type { Account } from '@dfinity/ckbtc';
import { authStore } from '@stores/auth.store';
import { toast } from 'svelte-sonner';
import { get } from 'svelte/store';
let toastId: string | number;
export const transferCkBTC = async ({
	amount,
	to,
	note
}: {
	amount: number;
	to: Account;
	note?: string;
}) => {
	try {
		const { identity } = get(authStore);

		toastId = toast.loading('Transfering ckBTC...', { id: toastId });
		const blockIndex = await transfer({
			identity,
			to,
			amount: BigInt(Math.floor(amount * DIVISOR)) // To remove decimal points after multiplication
		});
		toastId = toast.success('Transfered ckBTC', { id: toastId });

		await recordTransferTransactionService(blockIndex, note);
	} catch (error) {
		console.error(error);
		toastId = toast.error('Something went wrong while sending ckBTC.', { id: toastId });
	}
};

export const recordTransferTransactionService = async (txId: bigint, note?: string) => {
	try {
		const { identity } = get(authStore);
		toastId = toast.loading('Recording Transaction...', { id: toastId });
		const response = await recordTransferTransaction({ identity, txId, note });

		if ('Ok' in response) {
			toast.success('Transaction Recorded', { id: toastId });
			return;
		}

		const err = response.Err;

		if ('AlreadyRecorded' in err) {
			toastId = toast.info('Transaction already recorded!.', { id: toastId });
		} else if ('InterCanisterCall' in err) {
			console.error(err);
			toastId = toast.error(err.InterCanisterCall, { id: toastId });
		} else if ('InvalidTransaction' in err) {
			toastId = toast.error(`Invalid Transaction: ${err.InvalidTransaction}`, { id: toastId });
		} else if ('BothAccountsNotFound' in err) {
		}
	} catch (error) {
		console.error(error);
		toastId = toast.error('Something went wrong while recording Transaction.', { id: toastId });
	}
};
