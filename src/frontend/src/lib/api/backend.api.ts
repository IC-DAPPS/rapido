import { BackendCanister } from '$lib/canisters/backend.canister';
import type { AddMessageParams, ChatId, RecordXferParams } from '$lib/types/api';
import type { CommonCanisterApiFunctionParams } from '$lib/types/canister';
import { BACKEND_CANISTER_ID } from '@constants/app.constants';
import type { PayIdOrPrincipal, SignUpArg } from '@declarations/backend/backend.did';
import { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, type QueryParams } from '@dfinity/utils';

let canister: BackendCanister | undefined = undefined;

export const addMessage = async ({
	identity,
	chatId,
	content
}: CommonCanisterApiFunctionParams<AddMessageParams>) => {
	const { addMessage } = await backendCanister({ identity });

	return addMessage({ chatId, content });
};

export const createChat = async ({
	identity,
	payIdOrPrincipal
}: CommonCanisterApiFunctionParams<{ payIdOrPrincipal: PayIdOrPrincipal }>) => {
	const { createChat } = await backendCanister({ identity });

	return createChat(payIdOrPrincipal);
};

export const fetchAllData = async ({
	identity,
	certified = false
}: CommonCanisterApiFunctionParams<QueryParams>) => {
	const { fetchAllData } = await backendCanister({ identity });

	return fetchAllData({ certified });
};

export const fetchInitialData = async ({
	identity,
	certified = false
}: CommonCanisterApiFunctionParams<QueryParams>) => {
	const { fetchInitialData } = await backendCanister({ identity });

	return fetchInitialData({ certified });
};

export const getMyChats = async ({
	identity,
	certified = false
}: CommonCanisterApiFunctionParams<QueryParams>) => {
	const { getMyChats } = await backendCanister({ identity });

	return getMyChats({ certified });
};

export const markMessageRead = async ({
	identity,
	chatId
}: CommonCanisterApiFunctionParams<{ chatId: ChatId }>) => {
	const { markMessageRead } = await backendCanister({ identity });
	return markMessageRead(chatId);
};

export const recordTransferTransaction = async ({
	identity,
	txId,
	note
}: CommonCanisterApiFunctionParams<RecordXferParams>) => {
	const { recordTransferTransaction } = await backendCanister({ identity });
	return recordTransferTransaction({ txId, note });
};

export const signUp = async ({
	identity,
	signUpArg
}: CommonCanisterApiFunctionParams<{ signUpArg: SignUpArg }>) => {
	const { signUp } = await backendCanister({ identity });
	return signUp(signUpArg);
};

export const userAddBusiness = async ({
	identity,
	payIdOrPrincipal
}: CommonCanisterApiFunctionParams<{ payIdOrPrincipal: PayIdOrPrincipal }>) => {
	const { userAddBusiness } = await backendCanister({ identity });
	return userAddBusiness(payIdOrPrincipal);
};

const backendCanister = async ({
	identity,
	nullishIdentityErrorMessage = 'Identity is nullish',
	canisterId = BACKEND_CANISTER_ID
}: CommonCanisterApiFunctionParams): Promise<BackendCanister> => {
	assertNonNullish(identity, nullishIdentityErrorMessage);

	// Need to implement checking of identity when signout -> signIn
	if (isNullish(canister)) {
		canister = await BackendCanister.create({
			identity,
			canisterId: Principal.fromText(canisterId)
		});
	}

	return canister;
};
