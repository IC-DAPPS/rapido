import { BackendCanister } from '$lib/canisters/backend.canister';
import type {
	AddMessageParams,
	AddMessageResponse,
	ChatId,
	CreateChatResponse,
	FetchDataResponse,
	IsPayIdAvailableParams,
	MarkMessageReadResponse,
	RecordXferParams,
	RecordXferTxResponse,
	SignUpResponse,
	UserAddBusinessResponse
} from '$lib/types/api';
import type { CommonCanisterApiFunctionParams } from '$lib/types/canister';
import { BACKEND_CANISTER_ID } from '@constants/app.constants';
import type { Chat, PayIdOrPrincipal, SignUpArg } from '@declarations/backend/backend.did';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, type QueryParams } from '@dfinity/utils';
import { isIdentityNotEqual } from '@utils/identity.utils';

let canister: BackendCanister | undefined = undefined;
let currentIdentity: Identity;

export const addMessage = async ({
	identity,
	chatId,
	content
}: CommonCanisterApiFunctionParams<AddMessageParams>): Promise<AddMessageResponse> => {
	const { addMessage } = await backendCanister({ identity });

	return addMessage({ chatId, content });
};

export const createChat = async ({
	identity,
	payIdOrPrincipal
}: CommonCanisterApiFunctionParams<{
	payIdOrPrincipal: PayIdOrPrincipal;
}>): Promise<CreateChatResponse> => {
	const { createChat } = await backendCanister({ identity });

	return createChat(payIdOrPrincipal);
};

export const fetchAllData = async ({
	identity,
	certified = false
}: CommonCanisterApiFunctionParams<QueryParams>): Promise<FetchDataResponse> => {
	const { fetchAllData } = await backendCanister({ identity });

	return fetchAllData({ certified });
};

export const fetchInitialData = async ({
	identity,
	certified = false
}: CommonCanisterApiFunctionParams<QueryParams>): Promise<FetchDataResponse> => {
	const { fetchInitialData } = await backendCanister({ identity });

	return fetchInitialData({ certified });
};

export const getMyChats = async ({
	identity,
	certified = false
}: CommonCanisterApiFunctionParams<QueryParams>): Promise<Chat[]> => {
	const { getMyChats } = await backendCanister({ identity });

	return getMyChats({ certified });
};

export const isPayIdAvailable = async ({
	identity,
	payId,
	certified = false
}: CommonCanisterApiFunctionParams<IsPayIdAvailableParams>): Promise<boolean> => {
	const { isPayIdAvailable } = await backendCanister({ identity });

	return isPayIdAvailable({ certified, payId });
};

export const markMessageRead = async ({
	identity,
	chatId
}: CommonCanisterApiFunctionParams<{ chatId: ChatId }>): Promise<MarkMessageReadResponse> => {
	const { markMessageRead } = await backendCanister({ identity });
	return markMessageRead(chatId);
};

export const recordTransferTransaction = async ({
	identity,
	txId,
	note
}: CommonCanisterApiFunctionParams<RecordXferParams>): Promise<RecordXferTxResponse> => {
	const { recordTransferTransaction } = await backendCanister({ identity });
	return recordTransferTransaction({ txId, note });
};

export const signUp = async ({
	identity,
	signUpArg
}: CommonCanisterApiFunctionParams<{ signUpArg: SignUpArg }>): Promise<SignUpResponse> => {
	const { signUp } = await backendCanister({ identity });
	return signUp(signUpArg);
};

export const userAddBusiness = async ({
	identity,
	payIdOrPrincipal
}: CommonCanisterApiFunctionParams<{
	payIdOrPrincipal: PayIdOrPrincipal;
}>): Promise<UserAddBusinessResponse> => {
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
	if (isNullish(canister) || isIdentityNotEqual(currentIdentity, identity)) {
		canister = await BackendCanister.create({
			identity,
			canisterId: Principal.fromText(canisterId)
		});

		currentIdentity = identity;
	}

	return canister;
};
