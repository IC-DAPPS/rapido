import { getIcrcLedgerCanister } from '$lib/canisters/icrc-ledger.canister';
import type { CommonCanisterApiFunctionParams } from '$lib/types/canister';
import { CKBTC_TEST_LEDGER_CANISTER_ID } from '@constants/app.constants';

import type {
	AllowanceParams,
	ApproveParams,
	BalanceParams,
	Icrc21ConsentMessageParams,
	IcrcLedgerCanister,
	IcrcTokenMetadataResponse,
	TransferFromParams,
	TransferParams
} from '@dfinity/ledger-icrc';
import type { BlockIndex } from '@dfinity/ledger-icrc/dist/candid/icrc_index-ng';
import type {
	Allowance,
	icrc21_consent_info,
	Tokens
} from '@dfinity/ledger-icrc/dist/candid/icrc_ledger';
import { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, type QueryParams } from '@dfinity/utils';

let canister: IcrcLedgerCanister | undefined = undefined;

export const metadata = async ({
	identity,
	certified = false
}: CommonCanisterApiFunctionParams<QueryParams>): Promise<IcrcTokenMetadataResponse> => {
	const { metadata } = await ckBtcLedgerCanister({ identity });

	return metadata({ certified });
};

export const transactionFee = async ({
	identity,
	certified = false
}: CommonCanisterApiFunctionParams<QueryParams>): Promise<> => {
	const { transactionFee } = await ckBtcLedgerCanister({ identity });

	return transactionFee({ certified });
};

export const balance = async ({
	identity,
	owner,
	subaccount,
	certified = false
}: CommonCanisterApiFunctionParams<BalanceParams>): Promise<Tokens> => {
	const { balance } = await ckBtcLedgerCanister({ identity });

	return balance({ owner, subaccount, certified });
};

export const transfer = async ({
	identity,
	to,
	fee,
	memo,
	from_subaccount,
	created_at_time,
	amount
}: CommonCanisterApiFunctionParams<TransferParams>): Promise<BlockIndex> => {
	const { transfer } = await ckBtcLedgerCanister({ identity });

	return transfer({ to, fee, memo, from_subaccount, created_at_time, amount });
};

export const totalTokensSupply = async ({
	identity,
	certified = false
}: CommonCanisterApiFunctionParams<QueryParams>): Promise<Tokens> => {
	const { totalTokensSupply } = await ckBtcLedgerCanister({ identity });

	return totalTokensSupply({ certified });
};

export const transferFrom = async ({
	identity,
	from,
	spender_subaccount,
	to,
	fee,
	memo,
	created_at_time,
	amount
}: CommonCanisterApiFunctionParams<TransferFromParams>): Promise<BlockIndex> => {
	const { transferFrom } = await ckBtcLedgerCanister({ identity });

	return transferFrom({ from, spender_subaccount, to, fee, memo, created_at_time, amount });
};

export const approve = async ({
	identity,
	fee,
	memo,
	from_subaccount,
	created_at_time,
	amount,
	expected_allowance,
	expires_at,
	spender
}: CommonCanisterApiFunctionParams<ApproveParams>): Promise<BlockIndex> => {
	const { approve } = await ckBtcLedgerCanister({ identity });

	return approve({
		fee,
		memo,
		from_subaccount,
		created_at_time,
		amount,
		expected_allowance,
		expires_at,
		spender
	});
};

export const allowance = async ({
	identity,
	account,
	spender,
	certified = false
}: CommonCanisterApiFunctionParams<AllowanceParams>): Promise<Allowance> => {
	const { allowance } = await ckBtcLedgerCanister({ identity });

	return allowance({ account, spender, certified });
};

export const consentMessage = async ({
	identity,
	arg,
	method,
	userPreferences
}: CommonCanisterApiFunctionParams<Icrc21ConsentMessageParams>): Promise<icrc21_consent_info> => {
	const { consentMessage } = await ckBtcLedgerCanister({ identity });

	return consentMessage({ arg, method, userPreferences });
};

const ckBtcLedgerCanister = async ({
	identity,
	nullishIdentityErrorMessage = 'Identity is nullish',
	canisterId = CKBTC_TEST_LEDGER_CANISTER_ID
}: CommonCanisterApiFunctionParams): Promise<IcrcLedgerCanister> => {
	assertNonNullish(identity, nullishIdentityErrorMessage);

	// Need to implement checking of identity when signout -> signIn
	if (isNullish(canister)) {
		canister = await getIcrcLedgerCanister({ identity, canisterId: Principal.from(canisterId) });
	}

	return canister;
};
