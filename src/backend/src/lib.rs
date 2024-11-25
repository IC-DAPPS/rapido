use candid::{Nat, Principal};
use ic_cdk::caller;
use ic_cdk_macros::{query, update};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap,
};
use serde::{Deserialize, Serialize};
use std::cell::RefCell;

mod error;
use error::{
    AddBusinessError, AddMessageErr, CreateChatErr, FetchInitDataError, GetBusinessError, MarkMessageReadErr, RecordRegPayTxErr, RecordTxErr, RequestPaymentError, SignUpError
};

mod business;
use business::{
    is_business, BtoBTxArg, Business, BusinessSignUpArgs, BusinessTxArg, BusinessUnknownTxArg,
};

mod user;
use user::{
    is_user, BusinessInUser, Chat, ChatId, Message, PayIdOrPrincipal, RecordReqPayTxArg, ReqPayArg, RequestPayment, User, UserBusinessTxArg, UserData, UserSignUpArgs, UserToUserTxArg, UserUnknownTxArg
};

mod ck_btc_ledger;
use ck_btc_ledger::GetTransactionsResponse;

pub type Memory = VirtualMemory<DefaultMemoryImpl>;

const BUSINESS_MAP_MEMORY_ID: MemoryId = MemoryId::new(0);
const PAY_ID_MAP_MEMORY_ID: MemoryId = MemoryId::new(1);
const USERS_MAP_MEMORY_ID: MemoryId = MemoryId::new(2);
const CHATS_MAP_MEMORY_ID: MemoryId = MemoryId::new(3);
const BUSINESS_IN_USER_MAP_MEMORY_ID: MemoryId = MemoryId::new(4);
const TRANSACTION_HISTORY_MAP_MEMORY_ID: MemoryId = MemoryId::new(5);

const BI_LOOKUP_MAP_MEMORY_ID: MemoryId = MemoryId::new(6);

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static BUSINESS_MAP: RefCell<StableBTreeMap<Principal, Business, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(BUSINESS_MAP_MEMORY_ID)),
        )
    );

    static PAY_ID_MAP: RefCell<StableBTreeMap<String, Principal, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(PAY_ID_MAP_MEMORY_ID)),
        )
    );

    static USERS_MAP: RefCell<StableBTreeMap<Principal, User, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(USERS_MAP_MEMORY_ID)),
        )
    );

    static CHATS_MAP: RefCell<StableBTreeMap<ChatId, Chat, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(CHATS_MAP_MEMORY_ID)),
        )
    );

    static BUSINESS_IN_USER_MAP: RefCell<StableBTreeMap<String, BusinessInUser, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(BUSINESS_IN_USER_MAP_MEMORY_ID)),
        )
    );

    static TRANSACTION_HISTORY_MAP: RefCell<StableBTreeMap<Principal, StoreHistory, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(TRANSACTION_HISTORY_MAP_MEMORY_ID)),
        )
    );

    static BI_LOOKUP_MAP: RefCell<StableBTreeMap<BI, TxInfo, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(BI_LOOKUP_MAP_MEMORY_ID)),
        )
    );
}

pub struct PayIds;

impl PayIds {
    pub fn get(key: &String) -> Option<Principal> {
        PAY_ID_MAP.with(|p| p.borrow().get(key))
    }

    pub fn get_mut(key: &String) -> Option<Principal> {
        PAY_ID_MAP.with(|p| p.borrow_mut().get(key))
    }

    pub fn insert(key: String, value: Principal) -> Option<Principal> {
        PAY_ID_MAP.with(|p| p.borrow_mut().insert(key, value))
    }

    pub fn remove(key: String) -> Option<Principal> {
        PAY_ID_MAP.with(|p| p.borrow_mut().remove(&key))
    }

    pub fn contains_key(key: &String) -> bool {
        PAY_ID_MAP.with(|p| p.borrow().contains_key(key))
    }
}

fn is_payid_exist(pay_id: &String) -> bool {
    PayIds::contains_key(pay_id)
}

use candid::{Decode, Encode};
use ic_stable_structures::storable::{Bound, Storable};
use std::borrow::Cow;

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize)]
pub enum TxKind {
    Receive,
    Sends,
}

// Used for storing Tx History both in user and Business
#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize)]
pub struct TransactionEntry {
    kind: TxKind, // It depends on the user who added this history(eg user send kind i send)
    name: String, // name of who send or receive the tx (the other user  mentioned in transaction)
    pay_id: String, // pay_id of who send or receive the tx (the other user  mentioned in transaction)
    tx_id: candid::Nat,
    timestamp: u64,
    amount: candid::Nat,
    note: Option<String>,
}

pub type TxHistory = Vec<TransactionEntry>;

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize, Default)]
pub struct StoreHistory {
    history: TxHistory,
}

impl Storable for StoreHistory {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

#[derive(
    candid::CandidType,
    Clone,
    Serialize,
    Debug,
    Deserialize,
    Default,
    Eq,
    PartialEq,
    PartialOrd,
    Ord,
)]
pub struct BI(Nat);

impl Storable for BI {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}
#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize, Default)]
pub struct TxInfo {
    from: Option<Principal>,
    to: Option<Principal>,
}

impl Storable for TxInfo {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl BI {
    pub fn get(key: Nat) -> Option<TxInfo> {
        BI_LOOKUP_MAP.with(|p| p.borrow().get(&BI(key)))
    }

    pub fn insert(key: Nat, value: TxInfo) -> Option<TxInfo> {
        BI_LOOKUP_MAP.with(|p| p.borrow_mut().insert(BI(key), value))
    }

    pub fn remove(key: Nat) -> Option<TxInfo> {
        BI_LOOKUP_MAP.with(|p| p.borrow_mut().remove(&BI(key)))
    }

    pub fn contains_key(key: Nat) -> bool {
        BI_LOOKUP_MAP.with(|p| p.borrow().contains_key(&BI(key)))
    }
}

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize)]
pub enum SignUpArg {
    User(UserSignUpArgs),
    Business(BusinessSignUpArgs),
}

#[update]
pub fn sign_up(args: SignUpArg) -> Result<(), SignUpError> {
    match args {
        SignUpArg::User(arg) => user::sign_up_user(arg),
        SignUpArg::Business(arg) => business::sign_up_business(arg),
    }
}

#[query]
pub fn get_business() -> Result<Business, GetBusinessError> {
    business::ic_get_business()
}

#[query]
pub fn get_my_chats() -> Vec<Chat> {
    user::get_my_chats()
}
#[query]
pub fn get_user() -> Option<User> {
    user::get_user()
}

#[update]
pub fn create_chat(participant_id: user::PayIdOrPrincipal) -> Result<Chat, CreateChatErr> {
    user::create_chat(participant_id)
}

#[update]
pub fn add_message(chat_id: ChatId, content: String) -> Result<Message, AddMessageErr> {
    user::add_message(chat_id, content)
}

#[update]
pub fn mark_message_read(chat_id: ChatId) -> Result<(), MarkMessageReadErr> {
    user::mark_message_read(chat_id)
}

#[query]
pub fn get_chat(chat_id: ChatId) -> Option<Chat> {
    user::get_chat(chat_id)
}

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize)]
pub enum DataResponse {
    NotSignUp,
    User(UserData),
    Business(Business),
}

#[query]
pub fn fetch_initial_data() -> Result<DataResponse, FetchInitDataError> {
    let caller = caller();

    if is_business(&caller) {
        Ok(DataResponse::Business(business::fetch_init_business_data()))
    } else if is_user(&caller) {
        Ok(DataResponse::User(user::fetch_init_user_data()))
    } else {
        if caller == Principal::anonymous() {
            Err(FetchInitDataError::AnonymousCaller)
        } else {
            Ok(DataResponse::NotSignUp)
        }
    }
}

#[query]
pub fn fetch_data() -> Result<DataResponse, FetchInitDataError> {
    let caller = caller();

    if is_business(&caller) {
        Ok(DataResponse::Business(business::fetch_business_data()))
    } else if is_user(&caller) {
        Ok(DataResponse::User(user::fetch_user_data()))
    } else {
        if caller == Principal::anonymous() {
            Err(FetchInitDataError::AnonymousCaller)
        } else {
            Ok(DataResponse::NotSignUp)
        }
    }
}

#[update]
pub fn user_add_business(arg: PayIdOrPrincipal) -> Result<BusinessInUser, AddBusinessError> {
    user::user_add_business(arg)
}

#[update]
pub async fn record_xfer_transaction(
    tx_id: candid::Nat,
    note: Option<String>,
) -> Result<(), RecordTxErr> {
    if BI::contains_key(tx_id.clone()) {
        return Err(RecordTxErr::AlreadyRecorded);
    }

    let (get_tx_response,) = ck_btc_ledger::get_transactions(true, tx_id.clone())
        .await
        .map_err(|err| {
            RecordTxErr::InterCanisterCall(format!("get_transactions failed {:?}", err))
        })?;

    let TransferTx {
        from,
        to,
        timestamp,
        amount,
    } = match inspect_xfer_transaction(tx_id.clone(), get_tx_response) {
        Ok(xfer_tx) => xfer_tx,
        Err(err) => return Err(err),
    };

    let is_from_is_user = is_user(&from);
    let is_to_is_user = is_user(&to);
    let is_from_is_busi = is_business(&from);
    let is_to_is_busi = is_business(&to);

    if is_from_is_user && is_to_is_user {
        // record both
        user::add_user_to_user_transaction(UserToUserTxArg {
            from,
            to,
            timestamp,
            note,
            amount,
            tx_id: tx_id.clone(),
        });
    } else if is_from_is_user && is_to_is_busi {
        // record both
        business::add_business_transaction(BusinessTxArg {
            b_principal: to,
            u_principal: from,
            tx_kind: TxKind::Receive,
            amount: amount.clone(),
            timestamp,
            tx_id: tx_id.clone(),
        });

        user::add_user_business_transaction(UserBusinessTxArg {
            tx_id: tx_id.clone(),
            amount,
            timestamp,
            b_principal: to,
            u_principal: from,
            note,
            tx_kind: TxKind::Sends,
        });
    } else if is_from_is_busi && is_to_is_user {
        // record both

        business::add_business_transaction(BusinessTxArg {
            b_principal: from,
            u_principal: to,
            tx_kind: TxKind::Sends,
            amount: amount.clone(),
            timestamp,
            tx_id: tx_id.clone(),
        });

        user::add_user_business_transaction(UserBusinessTxArg {
            tx_id: tx_id.clone(),
            amount,
            timestamp,
            b_principal: from,
            u_principal: to,
            note,
            tx_kind: TxKind::Receive,
        });
    } else if is_from_is_busi && is_to_is_busi {
        // record both
        business::add_business_to_business_transaction(BtoBTxArg {
            from,
            to,
            timestamp,
            note,
            amount,
            tx_id: tx_id.clone(),
        })
    } else if is_from_is_user || is_from_is_busi {
        // if from account exist
        if is_from_is_user {
            user::add_unknown_transaction(UserUnknownTxArg {
                tx_id: tx_id.clone(),
                u_principal: from,
                unknown: to,
                amount,
                timestamp,
                note,
                tx_kind: TxKind::Sends,
            });
        } else {
            business::add_unknown_transaction(BusinessUnknownTxArg {
                tx_id: tx_id.clone(),
                b_principal: from,
                unknown: to,
                amount,
                timestamp,
                note,
                tx_kind: TxKind::Sends,
            });
        }
    } else if is_to_is_user || is_to_is_busi {
        // if to account exist
        if is_to_is_user {
            user::add_unknown_transaction(UserUnknownTxArg {
                tx_id: tx_id.clone(),
                u_principal: to,
                unknown: from,
                amount,
                timestamp,
                note,
                tx_kind: TxKind::Receive,
            });
        } else {
            business::add_unknown_transaction(BusinessUnknownTxArg {
                tx_id: tx_id.clone(),
                b_principal: to,
                unknown: from,
                amount,
                timestamp,
                note,
                tx_kind: TxKind::Receive,
            });
        }
    } else {
        return Err(RecordTxErr::BothAccountsNotFound { from, to });
    }

    BI::insert(
        tx_id,
        TxInfo {
            from: Some(from),
            to: Some(to),
        },
    );

    Ok(())
}


#[update]
pub fn payment_request_message(args: ReqPayArg) -> Result<RequestPayment, RequestPaymentError>{
    user::request_payment(args)
}

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize)]
pub struct RecordReqPayArg {
    tx_id: Nat,
    chat_id: ChatId,
    message_index: usize,
}

#[update]
pub async fn record_request_payment(
    RecordReqPayArg {
        tx_id,
        chat_id,
        message_index,
    }: RecordReqPayArg,
) -> Result<(), RecordRegPayTxErr> {
    if BI::contains_key(tx_id.clone()) {
        return Err(RecordRegPayTxErr::AlreadyRecorded);
    }

    let (get_tx_response,) = ck_btc_ledger::get_transactions(true, tx_id.clone())
        .await
        .map_err(|err| {
            RecordRegPayTxErr::InterCanisterCall(format!("get_transactions failed {:?}", err))
        })?;

    let TransferTx {
        from,
        to,
        timestamp,
        amount,
    } = match inspect_xfer_transaction_for_req_payment(tx_id.clone(), get_tx_response) {
        Ok(xfer_tx) => xfer_tx,
        Err(err) => return Err(err),
    };

    match user::record_request_payment(RecordReqPayTxArg{
        from,
        to,
        timestamp,
        amount,
        tx_id: tx_id.clone(),
        chat_id,
        message_index,
    }) {
        Ok(()) => {
            BI::insert(
                tx_id,
                TxInfo {
                    from: Some(from),
                    to: Some(to),
                },
            );
        
            Ok(())
        },
        Err(err) =>  Err(err),
        
    }

 
}

#[query]
pub async fn is_pay_id_available(pay_id: String) -> bool {
    if pay_id.len() < 3 {
        return false;
    }
    match PayIds::get(&pay_id) {
        Some(_) => false,
        None => true,
    }
}

#[query]
pub async fn get_account_from_pay_id(pay_id: String) -> Option<Principal> {
    let caller = caller();

    if is_user(&caller) || is_business(&caller) {
        return PayIds::get(&pay_id);
    }

    None
}

struct TransferTx {
    from: Principal,
    to: Principal,
    timestamp: u64,
    amount: Nat,
}

fn inspect_xfer_transaction(
    tx_id: candid::Nat,
    mut arg: GetTransactionsResponse,
) -> Result<TransferTx, RecordTxErr> {
    if tx_id >= arg.log_length {
        return Err(RecordTxErr::InvalidTransaction(format!(
            "Invalid ckBTC transaction ID: {tx_id}, Latest transaction ID: {}",
            arg.log_length
        )));
    }

    // Panics if index is out of bounds. cases: transaction archived, invalid block index, length arg is 0
    let transaction = arg.transactions.swap_remove(0);

    let transfer = match transaction.transfer {
        Some(xfer) => xfer,
        None => {
            return Err(RecordTxErr::InvalidTransaction(format!(
                "Expected Transfer, but Transaction kind is {}",
                transaction.kind
            )))
        }
    };

    Ok(TransferTx {
        from: transfer.from.owner,
        to: transfer.to.owner,
        timestamp: transaction.timestamp,
        amount: transfer.amount,
    })
}

fn inspect_xfer_transaction_for_req_payment(
    tx_id: candid::Nat,
    mut arg: GetTransactionsResponse,
) -> Result<TransferTx, RecordRegPayTxErr> {
    if tx_id >= arg.log_length {
        return Err(RecordRegPayTxErr::InvalidTransaction(format!(
            "Invalid ckBTC transaction ID: {tx_id}, Latest transaction ID: {}",
            arg.log_length
        )));
    }

    // Panics if index is out of bounds. cases: transaction archived, invalid block index, length arg is 0
    let transaction = arg.transactions.swap_remove(0);

    let transfer = match transaction.transfer {
        Some(xfer) => xfer,
        None => {
            return Err(RecordRegPayTxErr::InvalidTransaction(format!(
                "Expected Transfer, but Transaction kind is {}",
                transaction.kind
            )))
        }
    };

    Ok(TransferTx {
        from: transfer.from.owner,
        to: transfer.to.owner,
        timestamp: transaction.timestamp,
        amount: transfer.amount,
    })
}


#[test]
fn generate_candid() {
    candid::export_service!();

    std::fs::write("../distributed/backend/backend.did", __export_service())
        .expect("Failed to write backend.did");
}
