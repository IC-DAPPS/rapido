import {
	estimateWithdrawalFee,
	getMinterInfo,
	retrieveBtcWithApproval as retrieveBtcWithApprovalApi
} from '$lib/api/ck-btc-minter.api';
import { authStore } from '@stores/auth.store';
import { get } from 'svelte/store';
import {
	CKBTC_MINTER_CANISTER_ID,
	DIVISOR,
	NANO_SECONDS_IN_MINUTE
} from '@constants/app.constants';
import { toast } from 'svelte-sonner';
import { balance } from '@states/balance.svelte';
import { minterInfo, withdrawalFee } from '@states/btc-withdraw.svelte';
import {
	MinterAlreadyProcessingError,
	MinterAmountTooLowError,
	MinterGenericError,
	MinterInsufficientFundsError,
	MinterMalformedAddressError,
	MinterTemporaryUnavailableError
} from '@dfinity/ckbtc';
import { approve } from '$lib/api/ck-btc-ledger.api';
import { nowInBigIntNanoSeconds } from '@utils/date.utils';
import { Principal } from '@dfinity/principal';

let toastId: string | number;
export const fetchEstimateWithdrawalFee = async () => {
	const { identity } = get(authStore);

	try {
		const { bitcoin_fee, minter_fee } = await estimateWithdrawalFee({
			identity,
			certified: false,
			amount: balance.bigInt
		});

		//set estimateWithdrawalFee
		withdrawalFee.bitcoin_fee = Number(bitcoin_fee) / DIVISOR;
		withdrawalFee.minter_fee = Number(minter_fee) / DIVISOR;
	} catch (error) {
		console.error(error);

		toastId = toast.error('Something went wrong while fetching estimate withdrawal fee.', {
			id: toastId
		});
	}
};

export const fetchMinterInfo = async () => {
	try {
		const { retrieve_btc_min_amount, min_confirmations, kyt_fee } = await getMinterInfo({
			identity: get(authStore).identity,
			certified: false
		});

		//set minterInfo
		minterInfo.retrieve_btc_min_amount = Number(retrieve_btc_min_amount) / DIVISOR;
		minterInfo.min_confirmations = min_confirmations;
		minterInfo.kyt_fee = Number(kyt_fee) / DIVISOR;
	} catch (error) {
		console.error(error);

		toastId = toast.error('Something went wrong while fetching Minter Info.', {
			id: toastId
		});
	}
};

export const convertCkBTCToBtcIcrc2 = async ({
	amount,
	address
}: {
	amount: number;
	address: string;
}) => {
	toastId = toast.loading('Approving ckBTC Minter to Withdraw...');
	try {
		const { identity } = get(authStore);

		await approve({
			identity,
			amount: BigInt(amount * DIVISOR),
			// 5 minutes should be long enough to perform the transfer but if it
			// doesn't succeed we don't want the approval to remain valid
			// indefinitely.
			expires_at: nowInBigIntNanoSeconds() + BigInt(5 * NANO_SECONDS_IN_MINUTE),
			spender: { owner: Principal.fromText(CKBTC_MINTER_CANISTER_ID), subaccount: [] }
		});

		toast.loading('Retrieving BTC...', { id: toastId });

		await retrieveBtcWithApprovalApi({ identity, amount: BigInt(amount * DIVISOR), address });

		toast.success('Retrieving BTC...', { id: toastId });
	} catch (error) {
		console.error(error);

		toastId = toast.error(toastRetrieveBtcError(error), { id: toastId });
	}
};

// https://github.com/dfinity/nns-dapp/blob/9979071ed32321d8c61ac163067fafa60c3b0aee/frontend/src/lib/services/ckbtc-convert.services.ts#L127
const toastRetrieveBtcError = (err: unknown): string => {
	if (err instanceof MinterTemporaryUnavailableError) {
		return 'The minter is temporarily unavailable.';
	}

	if (err instanceof MinterAlreadyProcessingError) {
		return 'The minter has already been notified and updating the balance is in progress.';
	}

	if (err instanceof MinterMalformedAddressError) {
		return 'Address malformed.';
	}

	if (err instanceof MinterAmountTooLowError) {
		return 'Amount too low.';
	}

	if (err instanceof MinterInsufficientFundsError) {
		return 'Insufficient funds.';
	}

	if (err instanceof MinterGenericError) {
		return 'Sorry, retrieving BTC failed.';
	}

	return 'Sorry, retrieving BTC failed for an unknown reason.';
};
