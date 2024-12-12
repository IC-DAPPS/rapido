import { BackendCanister } from '$lib/canisters/backend.canister';
import type {
	AddMessageParams,
	AddMessageResponse,
	ChatId,
	CreateChatResponse,
	FetchDataResponse,
	GetNewBusinessTxsParams,
	IsPayIdAvailableParams,
	MarkMessageReadResponse,
	PaymentRequestParams,
	PaymentRequestResponse,
	RecordRequestPaymentResponse,
	RecordXferParams,
	RecordXferTxResponse,
	SignUpResponse,
	UserAddBusinessResponse
} from '$lib/types/api';
import type { CommonCanisterApiFunctionParams } from '$lib/types/canister';
import { BACKEND_CANISTER_ID } from '@constants/app.constants';
import type {
	Chat,
	PayIdOrPrincipal,
	RecordReqPayArg,
	SignUpArg,
	TransactionEntry
} from '@declarations/backend/backend.did';
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

export const getNewBusinessTransactions = async ({
	identity,
	length,
	certified = false
}: CommonCanisterApiFunctionParams<GetNewBusinessTxsParams>): Promise<TransactionEntry[]> => {
	const { getNewBusinessTransactions } = await backendCanister({ identity });

	return getNewBusinessTransactions({ length, certified });
};

export const isPayIdAvailable = async ({
	identity,
	payId,
	certified = false
}: CommonCanisterApiFunctionParams<IsPayIdAvailableParams>): Promise<boolean> => {
	const { isPayIdAvailable } = await backendCanister({ identity });

	return isPayIdAvailable({ certified, payId });
};

export const getAccountFromPayId = async ({
	identity,
	payId,
	certified = false
}: CommonCanisterApiFunctionParams<IsPayIdAvailableParams>): Promise<[] | [Principal]> => {
	const { getAccountFromPayId } = await backendCanister({ identity });

	return getAccountFromPayId({ certified, payId });
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

export const paymentRequestMessage = async ({
	identity,
	nullishIdentityErrorMessage,
	canisterId,
	...args
}: CommonCanisterApiFunctionParams<PaymentRequestParams>): Promise<PaymentRequestResponse> => {
	const { paymentRequestMessage } = await backendCanister({ identity });

	return paymentRequestMessage(args);
};

export const recordRequestPayment = async ({
	identity,
	nullishIdentityErrorMessage,
	canisterId,
	...args
}: CommonCanisterApiFunctionParams<RecordReqPayArg>): Promise<RecordRequestPaymentResponse> => {
	const { recordRequestPayment } = await backendCanister({ identity });

	return recordRequestPayment(args);
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
