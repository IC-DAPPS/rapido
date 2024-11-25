import type {
	AddBusinessError,
	AddMessageErr,
	BusinessInUser,
	Chat,
	CreateChatErr,
	DataResponse,
	FetchInitDataError,
	Message,
	RecordRegPayTxErr,
	RecordTxErr,
	RequestPayment,
	SignUpError
} from '@declarations/backend/backend.did';
import type { Option } from './utils';
import type { QueryParams } from '@dfinity/utils';

export type ChatId = string;

export type BlockIndex = bigint;

export interface AddMessageParams {
	chatId: ChatId;
	content: string;
}
export type AddMessageResponse = { Ok: Message } | { Err: AddMessageErr };

export type CreateChatResponse = { Ok: Chat } | { Err: CreateChatErr };

export type FetchDataResponse = { Ok: DataResponse } | { Err: FetchInitDataError };

export type MarkMessageReadResponse = { Ok: null } | { Err: AddMessageErr };

export interface RecordXferParams {
	txId: BlockIndex;
	note: Option<string>;
}
export type RecordXferTxResponse = { Ok: null } | { Err: RecordTxErr };

export type SignUpResponse = { Ok: null } | { Err: SignUpError };

export type UserAddBusinessResponse = { Ok: BusinessInUser } | { Err: AddBusinessError };

export interface IsPayIdAvailableParams extends QueryParams {
	payId: string;
}

export interface PaymentRequestParams {
	chatId: ChatId;
	amount: bigint;
	note: Option<string>;
}

export type PaymentRequestResponse = { Ok: RequestPayment } | { Err: AddMessageErr };

export type RecordRequestPaymentResponse = { Ok: null } | { Err: RecordRegPayTxErr };
