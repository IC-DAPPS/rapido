import { getCkBTCMinterCanister } from '$lib/canisters/ck-btc-minter.canister';
import type { CommonCanisterApiFunctionParams } from '$lib/types/canister';
import { CKBTC_TEST_MINTER_CANISTER_ID } from '@constants/app.constants';
import type { Identity } from '@dfinity/agent';
import type {
	CkBTCMinterCanister,
	EstimateWithdrawalFee,
	EstimateWithdrawalFeeParams,
	GetBTCAddressParams,
	GetKnownUtxosParams,
	MinterInfo,
	RetrieveBtcOk,
	RetrieveBtcParams,
	RetrieveBtcStatus,
	RetrieveBtcStatusV2ByAccountParams,
	RetrieveBtcStatusV2WithId,
	UpdateBalanceOk,
	UpdateBalanceParams,
	Utxo,
	WithdrawalAccount
} from '@dfinity/ckbtc';
import { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, type QueryParams } from '@dfinity/utils';
import { isIdentityNotEqual } from '@utils/identity.utils';

let canister: CkBTCMinterCanister | undefined = undefined;
let currentIdentity: Identity;

export const getBtcAddress = async ({
	identity,
	owner,
	subaccount
}: CommonCanisterApiFunctionParams<GetBTCAddressParams>): Promise<string> => {
	const { getBtcAddress } = await ckBTCMinterCanister({ identity });

	return getBtcAddress({ owner, subaccount });
};

export const updateBalance = async ({
	identity,
	owner,
	subaccount
}: CommonCanisterApiFunctionParams<UpdateBalanceParams>): Promise<UpdateBalanceOk> => {
	const { updateBalance } = await ckBTCMinterCanister({ identity });

	return updateBalance({ owner, subaccount });
};

export const getWithdrawalAccount = async ({
	identity
}: CommonCanisterApiFunctionParams): Promise<WithdrawalAccount> => {
	const { getWithdrawalAccount } = await ckBTCMinterCanister({ identity });

	return getWithdrawalAccount();
};

export const retrieveBtc = async ({
	identity,
	address,
	amount
}: CommonCanisterApiFunctionParams<RetrieveBtcParams>): Promise<RetrieveBtcOk> => {
	const { retrieveBtc } = await ckBTCMinterCanister({ identity });

	return retrieveBtc({ address, amount });
};

export const retrieveBtcWithApproval = async ({
	identity,
	address,
	amount,
	fromSubaccount
}: CommonCanisterApiFunctionParams<{
	address: string;
	amount: bigint;
	fromSubaccount?: Uint8Array;
}>): Promise<RetrieveBtcOk> => {
	const { retrieveBtcWithApproval } = await ckBTCMinterCanister({ identity });

	return retrieveBtcWithApproval({ address, amount, fromSubaccount });
};

export const retrieveBtcStatus = async ({
	identity,
	transactionId,
	certified
}: CommonCanisterApiFunctionParams<{
	transactionId: bigint;
	certified: boolean;
}>): Promise<RetrieveBtcStatus> => {
	const { retrieveBtcStatus } = await ckBTCMinterCanister({ identity });

	return retrieveBtcStatus({ transactionId, certified });
};

export const retrieveBtcStatusV2ByAccount = async ({
	identity,
	account,
	certified
}: CommonCanisterApiFunctionParams<RetrieveBtcStatusV2ByAccountParams>): Promise<
	RetrieveBtcStatusV2WithId[]
> => {
	const { retrieveBtcStatusV2ByAccount } = await ckBTCMinterCanister({ identity });

	return retrieveBtcStatusV2ByAccount({ account, certified });
};

export const estimateWithdrawalFee = async ({
	identity,
	certified,
	amount
}: CommonCanisterApiFunctionParams<EstimateWithdrawalFeeParams>): Promise<EstimateWithdrawalFee> => {
	const { estimateWithdrawalFee } = await ckBTCMinterCanister({ identity });

	return estimateWithdrawalFee({ certified, amount });
};

export const getMinterInfo = async ({
	identity,
	certified
}: CommonCanisterApiFunctionParams<QueryParams>): Promise<MinterInfo> => {
	const { getMinterInfo } = await ckBTCMinterCanister({ identity });

	return getMinterInfo({ certified });
};

export const getKnownUtxos = async ({
	identity,
	owner,
	subaccount,
	certified
}: CommonCanisterApiFunctionParams<GetKnownUtxosParams>): Promise<Utxo[]> => {
	const { getKnownUtxos } = await ckBTCMinterCanister({ identity });

	return getKnownUtxos({ owner, subaccount, certified });
};

const ckBTCMinterCanister = async ({
	identity,
	nullishIdentityErrorMessage = 'Identity is nullish',
	canisterId = CKBTC_TEST_MINTER_CANISTER_ID
}: CommonCanisterApiFunctionParams): Promise<CkBTCMinterCanister> => {
	assertNonNullish(identity, nullishIdentityErrorMessage);

	// Need to implement checking of identity when signout -> signIn
	if (isNullish(canister) || isIdentityNotEqual(currentIdentity, identity)) {
		canister = await getCkBTCMinterCanister({
			identity,
			canisterId: Principal.from(canisterId)
		});

		currentIdentity = identity;
	}

	return canister;
};
