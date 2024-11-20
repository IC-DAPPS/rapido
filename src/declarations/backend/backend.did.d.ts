import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type AddBusinessError = { 'AccountNotFound' : null } |
  { 'BusinessNotFound' : null };
export type AddMessageErr = { 'AccountNotFound' : null } |
  { 'ChatNotFound' : null } |
  { 'NotAParticipant' : null };
export interface Business {
  'logo' : string,
  'name' : string,
  'created_at' : bigint,
  'category' : BusinessCategory,
  'transactions' : Array<TransactionEntry>,
  'pay_id' : string,
}
export type BusinessCategory = { 'Healthcare' : null } |
  { 'RealEstate' : null } |
  { 'Food' : null } |
  { 'Energy' : null } |
  { 'Retail' : null } |
  { 'Professional' : null } |
  { 'Technology' : null } |
  { 'Entertainment' : null } |
  { 'Transportation' : null } |
  { 'Other' : null } |
  { 'Agriculture' : null } |
  { 'Education' : null } |
  { 'Finance' : null } |
  { 'Hospitality' : null } |
  { 'Construction' : null } |
  { 'Manufacturing' : null };
export interface BusinessInUser {
  'id' : string,
  'b_logo' : string,
  'b_name' : string,
  'b_pay_id' : string,
  'last_activity' : bigint,
  'b_category' : BusinessCategory,
  'b_principal' : Principal,
  'transactions' : Array<BusinessUserTx>,
}
export interface BusinessSignUpArgs {
  'logo' : string,
  'name' : string,
  'category' : BusinessCategory,
  'pay_id' : string,
}
export interface BusinessUserTx {
  'tx_id' : bigint,
  'note' : [] | [string],
  'sender_id' : string,
  'timestamp' : bigint,
  'amount' : bigint,
}
export interface Chat {
  'id' : string,
  'participants' : Array<string>,
  'messages' : Array<MessageOrTransaction>,
  'last_activity' : bigint,
}
export type CreateChatErr = { 'AccountNotFound' : null } |
  { 'ParticipantNotFound' : null } |
  { 'CallerAndParticipantSame' : null };
export type DataResponse = { 'User' : UserData } |
  { 'Business' : Business } |
  { 'NotSignUp' : null };
export type FetchInitDataError = { 'AnonymousCaller' : null };
export type GetBusinessError = { 'AccountNotFound' : null };
export interface Message {
  'read_by' : Array<string>,
  'content' : string,
  'sender_id' : string,
  'timestamp' : bigint,
}
export type MessageOrTransaction = { 'Transaction' : Transaction } |
  { 'Message' : Message };
export type PayIdOrPrincipal = { 'PayId' : string } |
  { 'Principal' : Principal };
export type RecordTxErr = { 'AlreadyRecorded' : null } |
  { 'InterCanisterCall' : string } |
  { 'InvalidTransaction' : string } |
  { 'BothAccountsNotFound' : { 'to' : Principal, 'from' : Principal } } |
  { 'FailedTo' : null };
export type Result = { 'Ok' : Message } |
  { 'Err' : AddMessageErr };
export type Result_1 = { 'Ok' : Chat } |
  { 'Err' : CreateChatErr };
export type Result_2 = { 'Ok' : DataResponse } |
  { 'Err' : FetchInitDataError };
export type Result_3 = { 'Ok' : Business } |
  { 'Err' : GetBusinessError };
export type Result_4 = { 'Ok' : null } |
  { 'Err' : AddMessageErr };
export type Result_5 = { 'Ok' : null } |
  { 'Err' : RecordTxErr };
export type Result_6 = { 'Ok' : null } |
  { 'Err' : SignUpError };
export type Result_7 = { 'Ok' : BusinessInUser } |
  { 'Err' : AddBusinessError };
export type SignUpArg = { 'User' : UserSignUpArgs } |
  { 'Business' : BusinessSignUpArgs };
export type SignUpError = { 'AccountExist' : null } |
  { 'PayIdExist' : null } |
  { 'AnonymousCaller' : null };
export interface Transaction {
  'read_by' : Array<string>,
  'tx_id' : bigint,
  'note' : [] | [string],
  'sender_id' : string,
  'timestamp' : bigint,
  'amount' : bigint,
}
export interface TransactionEntry {
  'tx_id' : bigint,
  'kind' : TxKind,
  'name' : string,
  'note' : [] | [string],
  'timestamp' : bigint,
  'amount' : bigint,
  'pay_id' : string,
}
export type TxKind = { 'Sends' : null } |
  { 'Receive' : null };
export interface User {
  'my_chats' : Array<[bigint, string]>,
  'name' : string,
  'created_at' : bigint,
  'with_businesses' : Array<[bigint, string]>,
  'profile_pic' : string,
  'pay_id' : string,
}
export interface UserData {
  'chats' : Array<Chat>,
  'user' : User,
  'history' : Array<TransactionEntry>,
  'business' : Array<BusinessInUser>,
}
export interface UserSignUpArgs {
  'name' : string,
  'profile_pic' : string,
  'pay_id' : string,
}
export interface _SERVICE {
  'add_message' : ActorMethod<[string, string], Result>,
  'create_chat' : ActorMethod<[PayIdOrPrincipal], Result_1>,
  'fetch_data' : ActorMethod<[], Result_2>,
  'fetch_initial_data' : ActorMethod<[], Result_2>,
  'get_business' : ActorMethod<[], Result_3>,
  'get_chat' : ActorMethod<[string], [] | [Chat]>,
  'get_my_chats' : ActorMethod<[], Array<Chat>>,
  'get_user' : ActorMethod<[], [] | [User]>,
  'is_pay_id_available' : ActorMethod<[string], boolean>,
  'mark_message_read' : ActorMethod<[string], Result_4>,
  'record_xfer_transaction' : ActorMethod<[bigint, [] | [string]], Result_5>,
  'sign_up' : ActorMethod<[SignUpArg], Result_6>,
  'user_add_business' : ActorMethod<[PayIdOrPrincipal], Result_7>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
