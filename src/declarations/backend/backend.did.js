export const idlFactory = ({ IDL }) => {
  const Message = IDL.Record({
    'read_by' : IDL.Vec(IDL.Text),
    'content' : IDL.Text,
    'sender_id' : IDL.Text,
    'timestamp' : IDL.Nat64,
  });
  const AddMessageErr = IDL.Variant({
    'AccountNotFound' : IDL.Null,
    'ChatNotFound' : IDL.Null,
    'NotAParticipant' : IDL.Null,
  });
  const Result = IDL.Variant({ 'Ok' : Message, 'Err' : AddMessageErr });
  const PayIdOrPrincipal = IDL.Variant({
    'PayId' : IDL.Text,
    'Principal' : IDL.Principal,
  });
  const RequestPayment = IDL.Record({
    'read_by' : IDL.Vec(IDL.Text),
    'tx_id' : IDL.Opt(IDL.Nat),
    'note' : IDL.Opt(IDL.Text),
    'requested_at' : IDL.Nat64,
    'sender_id' : IDL.Text,
    'payment_at' : IDL.Opt(IDL.Nat64),
    'amount' : IDL.Nat,
    'expires_at' : IDL.Nat64,
  });
  const Transaction = IDL.Record({
    'read_by' : IDL.Vec(IDL.Text),
    'tx_id' : IDL.Nat,
    'note' : IDL.Opt(IDL.Text),
    'sender_id' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'amount' : IDL.Nat,
  });
  const MessageOrTransaction = IDL.Variant({
    'RequestPayment' : RequestPayment,
    'Transaction' : Transaction,
    'Message' : Message,
  });
  const Chat = IDL.Record({
    'id' : IDL.Text,
    'participants' : IDL.Vec(IDL.Text),
    'messages' : IDL.Vec(MessageOrTransaction),
    'last_activity' : IDL.Nat64,
  });
  const CreateChatErr = IDL.Variant({
    'AccountNotFound' : IDL.Null,
    'ParticipantNotFound' : IDL.Null,
    'CallerAndParticipantSame' : IDL.Null,
  });
  const Result_1 = IDL.Variant({ 'Ok' : Chat, 'Err' : CreateChatErr });
  const User = IDL.Record({
    'my_chats' : IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Text)),
    'name' : IDL.Text,
    'created_at' : IDL.Nat64,
    'with_businesses' : IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Text)),
    'profile_pic' : IDL.Text,
    'pay_id' : IDL.Text,
  });
  const TxKind = IDL.Variant({ 'Sends' : IDL.Null, 'Receive' : IDL.Null });
  const TransactionEntry = IDL.Record({
    'tx_id' : IDL.Nat,
    'kind' : TxKind,
    'name' : IDL.Text,
    'note' : IDL.Opt(IDL.Text),
    'timestamp' : IDL.Nat64,
    'amount' : IDL.Nat,
    'pay_id' : IDL.Text,
  });
  const BusinessCategory = IDL.Variant({
    'Healthcare' : IDL.Null,
    'RealEstate' : IDL.Null,
    'Food' : IDL.Null,
    'Energy' : IDL.Null,
    'Retail' : IDL.Null,
    'Professional' : IDL.Null,
    'Technology' : IDL.Null,
    'Entertainment' : IDL.Null,
    'Transportation' : IDL.Null,
    'Other' : IDL.Null,
    'Agriculture' : IDL.Null,
    'Education' : IDL.Null,
    'Finance' : IDL.Null,
    'Hospitality' : IDL.Null,
    'Construction' : IDL.Null,
    'Manufacturing' : IDL.Null,
  });
  const BusinessUserTx = IDL.Record({
    'tx_id' : IDL.Nat,
    'note' : IDL.Opt(IDL.Text),
    'sender_id' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'amount' : IDL.Nat,
  });
  const BusinessInUser = IDL.Record({
    'id' : IDL.Text,
    'b_logo' : IDL.Text,
    'b_name' : IDL.Text,
    'b_pay_id' : IDL.Text,
    'last_activity' : IDL.Nat64,
    'b_category' : BusinessCategory,
    'b_principal' : IDL.Principal,
    'transactions' : IDL.Vec(BusinessUserTx),
  });
  const UserData = IDL.Record({
    'chats' : IDL.Vec(Chat),
    'user' : User,
    'history' : IDL.Vec(TransactionEntry),
    'business' : IDL.Vec(BusinessInUser),
  });
  const Business = IDL.Record({
    'logo' : IDL.Text,
    'name' : IDL.Text,
    'created_at' : IDL.Nat64,
    'category' : BusinessCategory,
    'transactions' : IDL.Vec(TransactionEntry),
    'pay_id' : IDL.Text,
  });
  const DataResponse = IDL.Variant({
    'User' : UserData,
    'Business' : Business,
    'NotSignUp' : IDL.Null,
  });
  const FetchInitDataError = IDL.Variant({ 'AnonymousCaller' : IDL.Null });
  const Result_2 = IDL.Variant({
    'Ok' : DataResponse,
    'Err' : FetchInitDataError,
  });
  const GetBusinessError = IDL.Variant({ 'AccountNotFound' : IDL.Null });
  const Result_3 = IDL.Variant({ 'Ok' : Business, 'Err' : GetBusinessError });
  const Result_4 = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : AddMessageErr });
  const ReqPayArg = IDL.Record({
    'note' : IDL.Opt(IDL.Text),
    'chat_id' : IDL.Text,
    'amount' : IDL.Nat,
  });
  const Result_5 = IDL.Variant({
    'Ok' : RequestPayment,
    'Err' : AddMessageErr,
  });
  const RecordReqPayArg = IDL.Record({
    'tx_id' : IDL.Nat,
    'chat_id' : IDL.Text,
    'message_index' : IDL.Nat64,
  });
  const RecordRegPayTxErr = IDL.Variant({
    'RequestPaymentNotFound' : IDL.Null,
    'AlreadyRecorded' : IDL.Null,
    'AccountNotFound' : IDL.Null,
    'InterCanisterCall' : IDL.Text,
    'InvalidTransaction' : IDL.Text,
    'ChatNotFound' : IDL.Null,
    'NotAParticipant' : IDL.Null,
    'BothAccountsNotFound' : IDL.Record({
      'to' : IDL.Principal,
      'from' : IDL.Principal,
    }),
  });
  const Result_6 = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : RecordRegPayTxErr });
  const RecordTxErr = IDL.Variant({
    'AlreadyRecorded' : IDL.Null,
    'InterCanisterCall' : IDL.Text,
    'InvalidTransaction' : IDL.Text,
    'BothAccountsNotFound' : IDL.Record({
      'to' : IDL.Principal,
      'from' : IDL.Principal,
    }),
  });
  const Result_7 = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : RecordTxErr });
  const UserSignUpArgs = IDL.Record({
    'name' : IDL.Text,
    'profile_pic' : IDL.Text,
    'pay_id' : IDL.Text,
  });
  const BusinessSignUpArgs = IDL.Record({
    'logo' : IDL.Text,
    'name' : IDL.Text,
    'category' : BusinessCategory,
    'pay_id' : IDL.Text,
  });
  const SignUpArg = IDL.Variant({
    'User' : UserSignUpArgs,
    'Business' : BusinessSignUpArgs,
  });
  const SignUpError = IDL.Variant({
    'AccountExist' : IDL.Null,
    'PayIdExist' : IDL.Null,
    'AnonymousCaller' : IDL.Null,
  });
  const Result_8 = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : SignUpError });
  const AddBusinessError = IDL.Variant({
    'AccountNotFound' : IDL.Null,
    'BusinessNotFound' : IDL.Null,
  });
  const Result_9 = IDL.Variant({
    'Ok' : BusinessInUser,
    'Err' : AddBusinessError,
  });
  return IDL.Service({
    'add_message' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'create_chat' : IDL.Func([PayIdOrPrincipal], [Result_1], []),
    'fetch_data' : IDL.Func([], [Result_2], ['query']),
    'fetch_initial_data' : IDL.Func([], [Result_2], ['query']),
    'get_account_from_pay_id' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(IDL.Principal)],
        ['query'],
      ),
    'get_business' : IDL.Func([], [Result_3], ['query']),
    'get_chat' : IDL.Func([IDL.Text], [IDL.Opt(Chat)], ['query']),
    'get_my_chats' : IDL.Func([], [IDL.Vec(Chat)], ['query']),
    'get_user' : IDL.Func([], [IDL.Opt(User)], ['query']),
    'is_pay_id_available' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    'mark_message_read' : IDL.Func([IDL.Text], [Result_4], []),
    'payment_request_message' : IDL.Func([ReqPayArg], [Result_5], []),
    'record_request_payment' : IDL.Func([RecordReqPayArg], [Result_6], []),
    'record_xfer_transaction' : IDL.Func(
        [IDL.Nat, IDL.Opt(IDL.Text)],
        [Result_7],
        [],
      ),
    'sign_up' : IDL.Func([SignUpArg], [Result_8], []),
    'user_add_business' : IDL.Func([PayIdOrPrincipal], [Result_9], []),
  });
};
export const init = ({ IDL }) => { return []; };
