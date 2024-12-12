import { getIcrcIndexNgCanister } from '$lib/canisters/icrc-index.canister';
import type { CommonCanisterApiFunctionParams } from '$lib/types/canister';
import { CKBTC_INDEX_CANISTER_ID } from '@constants/app.constants';
import type { Identity } from '@dfinity/agent';
import type {
	BalanceParams,
	GetIndexNgAccountTransactionsParams,
	IcrcIndexNgCanister
} from '@dfinity/ledger-icrc';
import type { GetTransactions, Tokens } from '@dfinity/ledger-icrc/dist/candid/icrc_index-ng';
import { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, type QueryParams } from '@dfinity/utils';
import { isIdentityNotEqual } from '@utils/identity.utils';

let canister: IcrcIndexNgCanister | undefined = undefined;
let currentIdentity: Identity;

export const getTransactions = async ({
	identity,
	...params
}: CommonCanisterApiFunctionParams<GetIndexNgAccountTransactionsParams>): Promise<GetTransactions> => {
	const { getTransactions } = await ckBtcIndexCanister({ identity });

	return getTransactions(params);
};

export const ledgerId = async ({
	identity,
	...params
}: CommonCanisterApiFunctionParams<QueryParams>): Promise<Principal> => {
	const { ledgerId } = await ckBtcIndexCanister({ identity });

	return ledgerId(params);
};

export const balance = async ({
	identity,
	owner,
	subaccount,
	certified = false
}: CommonCanisterApiFunctionParams<BalanceParams>): Promise<Tokens> => {
	const { balance } = await ckBtcIndexCanister({ identity });

	return balance({ owner, subaccount, certified });
};

const ckBtcIndexCanister = async ({
	identity,
	nullishIdentityErrorMessage = 'Identity is nullish',
	canisterId = CKBTC_INDEX_CANISTER_ID
}: CommonCanisterApiFunctionParams): Promise<IcrcIndexNgCanister> => {
	assertNonNullish(identity, nullishIdentityErrorMessage);

	// Need to implement checking of identity when signout -> signIn
	if (isNullish(canister) || isIdentityNotEqual(currentIdentity, identity)) {
		canister = await getIcrcIndexNgCanister({
			identity,
			canisterId: Principal.from(canisterId)
		});

		currentIdentity = identity;
	}

	return canister;
};
