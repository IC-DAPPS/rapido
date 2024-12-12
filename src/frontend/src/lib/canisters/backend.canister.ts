import { getAgent } from '$lib/actors/agents.ic';
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
import type { CreateCanisterOptions } from '$lib/types/canister';
import { idlFactory as idlFactoryBackend } from '@declarations/backend';
import type {
	_SERVICE as BackendService,
	Chat,
	PayIdOrPrincipal,
	RecordReqPayArg,
	ReqPayArg,
	SignUpArg,
	TransactionEntry
} from '@declarations/backend/backend.did';
import { Principal } from '@dfinity/principal';
import { Canister, createServices, type QueryParams, nonNullish } from '@dfinity/utils';

export class BackendCanister extends Canister<BackendService> {
	static async create({ identity, ...options }: CreateCanisterOptions<BackendService>) {
		const agent = await getAgent({ identity });

		const { service, certifiedService, canisterId } = createServices<BackendService>({
			options: { agent, ...options },
			idlFactory: idlFactoryBackend,
			certifiedIdlFactory: idlFactoryBackend
		});

		return new BackendCanister(canisterId, service, certifiedService);
	}

	addMessage = async ({ chatId, content }: AddMessageParams): Promise<AddMessageResponse> => {
		const { add_message } = this.caller({ certified: true });

		return add_message(chatId, content);
	};

	createChat = (payIdOrPrincipal: PayIdOrPrincipal): Promise<CreateChatResponse> => {
		const { create_chat } = this.caller({ certified: true });

		return create_chat(payIdOrPrincipal);
	};

	fetchAllData = ({ certified }: QueryParams): Promise<FetchDataResponse> => {
		const { fetch_data } = this.caller({ certified });

		return fetch_data();
	};

	fetchInitialData = ({ certified }: QueryParams): Promise<FetchDataResponse> => {
		const { fetch_initial_data } = this.caller({ certified });

		return fetch_initial_data();
	};

	getMyChats = ({ certified }: QueryParams): Promise<Chat[]> => {
		const { get_my_chats } = this.caller({ certified });

		return get_my_chats();
	};

	getNewBusinessTransactions = ({
		certified,
		length
	}: GetNewBusinessTxsParams): Promise<TransactionEntry[]> => {
		const { get_new_business_transactions } = this.caller({ certified });

		return get_new_business_transactions(length);
	};

	isPayIdAvailable = ({ certified, payId }: IsPayIdAvailableParams): Promise<boolean> => {
		const { is_pay_id_available } = this.caller({ certified });

		return is_pay_id_available(payId);
	};

	getAccountFromPayId = ({
		certified,
		payId
	}: IsPayIdAvailableParams): Promise<[] | [Principal]> => {
		const { get_account_from_pay_id } = this.caller({ certified });

		return get_account_from_pay_id(payId);
	};

	markMessageRead = (chatId: ChatId): Promise<MarkMessageReadResponse> => {
		const { mark_message_read } = this.caller({ certified: true });

		return mark_message_read(chatId);
	};

	recordTransferTransaction = ({ txId, note }: RecordXferParams): Promise<RecordXferTxResponse> => {
		const { record_xfer_transaction } = this.caller({ certified: true });

		return record_xfer_transaction(txId, nonNullish(note) ? [note] : []);
	};

	signUp = (signUpArg: SignUpArg): Promise<SignUpResponse> => {
		const { sign_up } = this.caller({ certified: true });

		return sign_up(signUpArg);
	};

	userAddBusiness = (payIdOrPrincipal: PayIdOrPrincipal): Promise<UserAddBusinessResponse> => {
		const { user_add_business } = this.caller({ certified: true });

		return user_add_business(payIdOrPrincipal);
	};

	paymentRequestMessage = ({
		chatId,
		amount,
		note
	}: PaymentRequestParams): Promise<PaymentRequestResponse> => {
		const { payment_request_message } = this.caller({ certified: true });

		return payment_request_message({
			chat_id: chatId,
			amount,
			note: nonNullish(note) ? [note] : []
		});
	};

	recordRequestPayment = (arg: RecordReqPayArg): Promise<RecordRequestPaymentResponse> => {
		const { record_request_payment } = this.caller({ certified: true });

		return record_request_payment(arg);
	};

	// getBusiness = () => {};//query
	// getChat = () => {};//query
	// getUser = () => {};//query
}
