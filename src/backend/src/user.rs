use crate::business::{self, is_business, BusinessCategory};
use crate::error::{
    AddBusinessError, AddMessageErr, CreateChatErr, MarkMessageReadErr, RecordRegPayTxErr,
    RecordTxErr, RequestPaymentError, SignUpError,
};
use crate::{
    is_payid_exist, PayIds, StoreHistory, TransactionEntry, TxHistory, TxInfo, TxKind, BI,
    BUSINESS_IN_USER_MAP, CHATS_MAP, TRANSACTION_HISTORY_MAP, USERS_MAP,
};
use candid::{Decode, Encode, Nat, Principal};
use ic_cdk::{api::time, caller};
use ic_stable_structures::storable::{Bound, Storable};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use std::collections::BTreeSet;

type PayId = String;

#[derive(
    candid::CandidType,
    Clone,
    Serialize,
    Deserialize,
    Default,
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
)]
pub struct Message {
    // id: String,
    sender_id: PayId,
    content: String,
    timestamp: u64,
    read_by: Vec<PayId>, // Tracked read status
}

#[derive(
    candid::CandidType,
    Clone,
    Serialize,
    Deserialize,
    Default,
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
)]
pub struct Transaction {
    sender_id: PayId,
    timestamp: u64,
    note: Option<String>,
    amount: candid::Nat,
    tx_id: candid::Nat,
    read_by: Vec<PayId>, // Tracked read status
}

#[derive(
    candid::CandidType,
    Clone,
    Serialize,
    Deserialize,
    Default,
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
)]
pub struct RequestPayment {
    sender_id: PayId, // not transaction sender id . its the one who is requesting payment
    requested_at: u64,
    amount: candid::Nat,
    payment_at: Option<u64>,
    tx_id: Option<candid::Nat>,
    expires_at: u64,
    note: Option<String>,
    read_by: Vec<PayId>, // Tracked read status
}

#[derive(
    candid::CandidType, Clone, Serialize, Deserialize, Debug, Eq, PartialEq, Ord, PartialOrd,
)]
pub enum MessageOrTransaction {
    Message(Message),
    Transaction(Transaction),
    RequestPayment(RequestPayment),
}

pub type ChatId = String;

#[derive(
    candid::CandidType,
    Clone,
    Serialize,
    Deserialize,
    Default,
    Debug,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
)]
pub struct Chat {
    id: ChatId,
    participants: Vec<PayId>,
    messages: Vec<MessageOrTransaction>,
    last_activity: u64,
    // metadata: ChatMetadata, // New chat metadata
}
impl Storable for Chat {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

struct Chats;
impl Chats {
    fn get(key: &ChatId) -> Option<Chat> {
        CHATS_MAP.with(|p| p.borrow().get(key))
    }

    fn get_mut(key: &ChatId) -> Option<Chat> {
        CHATS_MAP.with(|p| p.borrow_mut().get(key))
    }

    fn insert(key: ChatId, value: Chat) -> Option<Chat> {
        CHATS_MAP.with(|p| p.borrow_mut().insert(key, value))
    }

    fn remove(key: &ChatId) -> Option<Chat> {
        CHATS_MAP.with(|p| p.borrow_mut().remove(key))
    }

    fn contains_key(key: &ChatId) -> bool {
        CHATS_MAP.with(|p| p.borrow().contains_key(key))
    }

    fn len() -> u64 {
        CHATS_MAP.with(|p| p.borrow().len())
    }
}

// #[derive(
//     Clone,
//     candid::CandidType,
//     Serialize,
//     Deserialize,
//     Default,
//     Debug,
//     Eq,
//     PartialEq,
//     Ord,
//     PartialOrd,
// )]
// struct ChatMetadata {
//     name: String,
//     avatar: Option<String>,
//     // Add other metadata fields as needed
// }
//

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize, Default)]
pub struct User {
    name: String,
    pay_id: String,
    profile_pic: String,
    created_at: u64,
    my_chats: BTreeSet<(u64, ChatId)>,
    with_businesses: BTreeSet<(u64, String)>,
}

impl Storable for User {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

struct Users;
impl Users {
    fn get(key: &Principal) -> Option<User> {
        USERS_MAP.with(|p| p.borrow().get(&key))
    }

    fn get_mut(key: &Principal) -> Option<User> {
        USERS_MAP.with(|p| p.borrow_mut().get(&key))
    }

    fn insert(key: Principal, value: User) -> Option<User> {
        USERS_MAP.with(|p| p.borrow_mut().insert(key, value))
    }

    fn remove(key: Principal) -> Option<User> {
        USERS_MAP.with(|p| p.borrow_mut().remove(&key))
    }

    fn contains_key(key: &Principal) -> bool {
        USERS_MAP.with(|p| p.borrow().contains_key(key))
    }
}

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize)]
pub struct BusinessUserTx {
    sender_id: PayId,
    timestamp: u64,
    note: Option<String>,
    amount: candid::Nat,
    tx_id: candid::Nat,
    // read_by: Vec<PayId>, // Tracked read status
}

// Unnecessory Duplication of Business profile data. (future version only store principal or pay_id of Business )
#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize)]
pub struct BusinessInUser {
    id: String,
    b_name: String,
    b_pay_id: PayId,
    b_logo: String,
    b_category: BusinessCategory,
    b_principal: Principal,
    // created_at: u64,
    transactions: Vec<BusinessUserTx>,
    last_activity: u64,
}
impl Storable for BusinessInUser {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl BusinessInUser {
    fn get(key: &String) -> Option<BusinessInUser> {
        BUSINESS_IN_USER_MAP.with(|p| p.borrow().get(key))
    }

    fn get_mut(key: &String) -> Option<BusinessInUser> {
        BUSINESS_IN_USER_MAP.with(|p| p.borrow_mut().get(key))
    }

    fn insert(key: String, value: BusinessInUser) -> Option<BusinessInUser> {
        BUSINESS_IN_USER_MAP.with(|p| p.borrow_mut().insert(key, value))
    }

    fn remove(key: &String) -> Option<BusinessInUser> {
        BUSINESS_IN_USER_MAP.with(|p| p.borrow_mut().remove(key))
    }

    fn contains_key(key: &String) -> bool {
        BUSINESS_IN_USER_MAP.with(|p| p.borrow().contains_key(key))
    }

    fn len() -> u64 {
        BUSINESS_IN_USER_MAP.with(|p| p.borrow().len())
    }
}

impl StoreHistory {
    fn get(key: &Principal) -> Option<StoreHistory> {
        TRANSACTION_HISTORY_MAP.with(|p| p.borrow().get(&key))
    }

    fn get_mut(key: &Principal) -> Option<StoreHistory> {
        TRANSACTION_HISTORY_MAP.with(|p| p.borrow_mut().get(&key))
    }

    fn insert(key: Principal, value: StoreHistory) -> Option<StoreHistory> {
        TRANSACTION_HISTORY_MAP.with(|p| p.borrow_mut().insert(key, value))
    }

    fn remove(key: Principal) -> Option<StoreHistory> {
        TRANSACTION_HISTORY_MAP.with(|p| p.borrow_mut().remove(&key))
    }

    fn contains_key(key: &Principal) -> bool {
        TRANSACTION_HISTORY_MAP.with(|p| p.borrow().contains_key(key))
    }

    fn new(value: TxHistory) -> Self {
        Self { history: value }
    }
    pub fn get_history(key: &Principal) -> Option<TxHistory> {
        match StoreHistory::get(key) {
            Some(store) => Some(store.history),
            None => None,
        }
    }

    pub fn insert_history(key: Principal, value: TxHistory) -> Option<TxHistory> {
        match StoreHistory::insert(key, StoreHistory::new(value)) {
            Some(store) => Some(store.history),
            None => None,
        }
    }
}

pub struct UserMetadata {
    pub name: String,
    pub pay_id: String,
    pub profile_pic: String,
    pub created_at: u64,
}

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize)]
pub enum PayIdOrPrincipal {
    Principal(Principal),
    PayId(PayId),
}

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize)]
pub struct UserData {
    user: User,
    history: Vec<TransactionEntry>,
    chats: Vec<Chat>,
    business: Vec<BusinessInUser>,
}

pub struct UserToUserTxArg {
    pub from: Principal,
    pub to: Principal,
    pub timestamp: u64,
    pub note: Option<String>,
    pub amount: Nat,
    pub tx_id: Nat,
    // is_read_by_sender: bool,
}

pub struct UserBusinessTxArg {
    pub tx_id: Nat,
    pub amount: Nat,
    pub timestamp: u64,
    pub b_principal: Principal, // business
    pub u_principal: Principal, // user
    pub note: Option<String>,
    pub tx_kind: TxKind, // Based on User (from or to)
}

pub struct UserUnknownTxArg {
    pub tx_id: Nat,
    pub u_principal: Principal, // User
    pub unknown: Principal,
    pub amount: Nat,
    pub timestamp: u64,
    pub note: Option<String>,
    pub tx_kind: TxKind, // Based on User (from or to)
}

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize)]
pub struct UserSignUpArgs {
    name: String,
    pay_id: String,
    profile_pic: String,
}

fn create_key(pay_id1: &PayId, pay_id2: &PayId) -> String {
    if pay_id1 > pay_id2 {
        return format!("{pay_id1}/{pay_id2}");
    } else if pay_id2 > pay_id1 {
        return format!("{pay_id2}/{pay_id1}");
    } else {
        ic_cdk::trap("Both PayIds are same")
    }
}

pub fn is_user(princpal: &Principal) -> bool {
    Users::contains_key(princpal)
}

pub fn get_metadata(principal: &Principal) -> Option<UserMetadata> {
    match Users::get(principal) {
        Some(u) => Some(UserMetadata {
            name: u.name,
            pay_id: u.pay_id,
            profile_pic: u.profile_pic,
            created_at: u.created_at,
        }),
        None => None,
    }
}

pub fn sign_up_user(args: UserSignUpArgs) -> Result<(), SignUpError> {
    let caller: Principal = caller();

    if caller == Principal::anonymous() {
        return Err(SignUpError::AnonymousCaller);
    }
    if is_user(&caller) || is_business(&caller) {
        return Err(SignUpError::AccountExist);
    }
    if is_payid_exist(&args.pay_id) {
        return Err(SignUpError::PayIdExist);
    }

    let pay_id = args.pay_id.clone();
    let user = User {
        name: args.name,
        pay_id: args.pay_id,
        profile_pic: args.profile_pic,
        created_at: time(),
        my_chats: BTreeSet::new(),
        with_businesses: BTreeSet::new(),
    };
    Users::insert(caller, user);
    PayIds::insert(pay_id, caller);
    Ok(())
}

pub fn create_chat(participant_id: PayIdOrPrincipal) -> Result<Chat, CreateChatErr> {
    let caller = caller();

    let mut user = match Users::get(&caller) {
        Some(user) => user,
        None => return Err(CreateChatErr::AccountNotFound),
    };

    let (participant_opt, participant_p): (Option<User>, Principal) = match participant_id {
        PayIdOrPrincipal::Principal(principal) => {
            // Check principal is same or not
            if caller == principal {
                return Err(CreateChatErr::CallerAndParticipantSame);
            }
            (Users::get(&principal), principal)
        }

        PayIdOrPrincipal::PayId(pay_id) => {
            // Check caller and participant same or not
            if &pay_id == &user.pay_id {
                return Err(CreateChatErr::CallerAndParticipantSame);
            }
            match PayIds::get(&pay_id) {
                Some(principal) => (Users::get(&principal), principal),
                None => return Err(CreateChatErr::ParticipantNotFound),
            }
        }
    };

    let mut participant = match participant_opt {
        Some(user) => user,
        None => return Err(CreateChatErr::ParticipantNotFound),
    };

    let chat_id = create_key(&user.pay_id, &participant.pay_id);

    if let Some(chat) = Chats::get(&chat_id) {
        return Ok(chat); // If chat exist already for the key return chat instead of creating new
    }

    let chat = Chat {
        id: chat_id.clone(),
        participants: vec![user.pay_id.clone(), participant.pay_id.clone()],
        messages: Vec::new(),
        last_activity: time(),
    };

    Chats::insert(chat_id.clone(), chat.clone());

    user.my_chats.insert((chat.last_activity, chat_id.clone()));
    participant.my_chats.insert((chat.last_activity, chat_id));

    Users::insert(caller, user);
    Users::insert(participant_p, participant);
    Ok(chat)
}

pub fn add_message(chat_id: ChatId, content: String) -> Result<Message, AddMessageErr> {
    let caller = caller();

    let mut user = match Users::get(&caller) {
        Some(user) => user,
        None => return Err(AddMessageErr::AccountNotFound), // caller account not found
    };

    let mut chat = match Chats::get(&chat_id) {
        Some(chat) => chat,
        None => return Err(AddMessageErr::ChatNotFound),
    };

    // Alternatively, we can check chat_id is contains in my_chats (faster search) if there are many participants in chat
    if !chat.participants.contains(&user.pay_id) {
        return Err(AddMessageErr::NotAParticipant);
    }
    let pre_last_activity = chat.last_activity;
    let message = Message {
        sender_id: user.pay_id.clone(),
        content,
        timestamp: time(),
        read_by: vec![user.pay_id.clone()],
    };

    chat.messages
        .push(MessageOrTransaction::Message(message.clone()));
    chat.last_activity = message.timestamp;

    // Update the ordering of the chat in the user's BTreeSet
    if !user.my_chats.remove(&(pre_last_activity, chat_id.clone())) {
        return Err(AddMessageErr::NotAParticipant);
    };
    user.my_chats.insert((chat.last_activity, chat_id.clone()));

    // Update the ordering of the chat in the user's BTreeSet
    for pay_id in &chat.participants {
        if pay_id == &user.pay_id {
            continue;
        }
        let principal = match PayIds::get(pay_id) {
            Some(principal) => principal,
            None => continue,
        };
        match Users::get(&principal) {
            Some(mut participant) => {
                participant
                    .my_chats
                    .remove(&(pre_last_activity, chat_id.clone()));
                participant
                    .my_chats
                    .insert((chat.last_activity, chat_id.clone()));
                Users::insert(principal, participant);
            }
            None => continue,
        }
    }

    Chats::insert(chat_id, chat);
    Users::insert(caller, user);

    Ok(message)
}

pub fn mark_message_read(chat_id: ChatId) -> Result<(), MarkMessageReadErr> {
    match Chats::get(&chat_id) {
        Some(mut chat) => {
            match Users::get(&caller()) {
                Some(user) => {
                    // Alternatively, we can check chat_id is contains in my_chats (faster search) if there are many participants in chat
                    if !chat.participants.contains(&user.pay_id) {
                        return Err(MarkMessageReadErr::NotAParticipant);
                    }

                    for msg_or_tx in chat.messages.iter_mut().rev() {
                        match msg_or_tx {
                            MessageOrTransaction::Message(msg) => {
                                if msg.read_by.contains(&user.pay_id) {
                                    break;
                                } else {
                                    msg.read_by.push(user.pay_id.clone());
                                }
                            }
                            MessageOrTransaction::Transaction(tx) => {
                                if tx.read_by.contains(&user.pay_id) {
                                    break;
                                } else {
                                    tx.read_by.push(user.pay_id.clone());
                                }
                            }
                            MessageOrTransaction::RequestPayment(req) => {
                                if req.read_by.contains(&user.pay_id) {
                                    break;
                                } else {
                                    req.read_by.push(user.pay_id.clone());
                                }
                            }
                        }
                    }

                    Chats::insert(chat_id, chat);
                    return Ok(());
                }
                None => return Err(MarkMessageReadErr::AccountNotFound),
            };
        }
        None => Err(MarkMessageReadErr::ChatNotFound),
    }
}

pub fn user_add_business(arg: PayIdOrPrincipal) -> Result<BusinessInUser, AddBusinessError> {
    let caller = caller();

    let mut user = match Users::get(&caller) {
        Some(user) => user,
        None => return Err(AddBusinessError::AccountNotFound),
    };

    let (business, b_principal) = match arg {
        PayIdOrPrincipal::Principal(principal) => match business::get_metadata(&principal) {
            Some(business) => (business, principal),
            None => return Err(AddBusinessError::BusinessNotFound),
        },

        PayIdOrPrincipal::PayId(pay_id) => match PayIds::get(&pay_id) {
            Some(principal) => match business::get_metadata(&principal) {
                Some(business) => (business, principal),
                None => return Err(AddBusinessError::BusinessNotFound),
            },
            None => return Err(AddBusinessError::BusinessNotFound),
        },
    };
    let id = create_key(&user.pay_id, &business.pay_id);

    if let Some(business_in_usr) = BusinessInUser::get(&id) {
        return Ok(business_in_usr); // if already exist for the key
    }

    let business_in_user = BusinessInUser {
        id: id.clone(),
        b_name: business.name,
        b_pay_id: business.pay_id,
        b_logo: business.logo,
        b_category: business.category,
        b_principal,
        transactions: Vec::new(),
        last_activity: time(),
    };

    BusinessInUser::insert(id.clone(), business_in_user.clone());
    user.with_businesses
        .insert((business_in_user.last_activity, id));
    Users::insert(caller, user);
    Ok(business_in_user)
}

// get all the chat associated with the caller. return empty if user not found or no chats
pub fn get_my_chats() -> Vec<Chat> {
    let mut chats = Vec::new();
    let user = match Users::get(&caller()) {
        Some(user) => user,
        None => return chats,
    };

    for (_, chat_id) in user.my_chats.iter() {
        match Chats::get(chat_id) {
            Some(chat) => chats.push(chat),
            None => continue,
        }
    }
    chats
}
// Sort by last_activity
// chats.sort_by(|a, b| b.last_activity.cmp(&a.last_activity));

// get a specific chat with id. Chat returned if caller is participant and chat is found otherwise return NONE
pub fn get_chat(chat_id: ChatId) -> Option<Chat> {
    let caller = caller();

    let pay_id = match Users::get(&caller) {
        Some(user) => user.pay_id,
        None => return None, // User not Found
    };
    let chat = match Chats::get(&chat_id) {
        Some(chat) => chat,
        None => return None, // Chat not found
    };
    if !chat.participants.contains(&pay_id) {
        Some(chat)
    } else {
        None // if caller is not participant
    }
}

pub fn add_user_to_user_transaction(
    UserToUserTxArg {
        from,
        to,
        timestamp,
        note,
        amount,
        tx_id,
    }: UserToUserTxArg,
) {
    /*

    * Note: Here we assume that anyone can call this notifying method, but tx will only added to From & To Users

    * Also if the chat doesn't exist between From & To Users this method will create a fresh chat instead of
    returning an error chat not found [This case is unlikely to happen]
    */

    // No need for second checking of Accounts, already checked in record_xfer_transaction function
    let mut from_user = Users::get(&from).unwrap();
    let mut to_user = Users::get(&to).unwrap();

    let chat_id = create_key(&from_user.pay_id, &to_user.pay_id);

    let mut chat = Chats::get(&chat_id).unwrap_or(Chat {
        id: chat_id.clone(),
        participants: vec![from_user.pay_id.clone(), to_user.pay_id.clone()],
        messages: Vec::new(),
        last_activity: timestamp,
    });
    let pre_last_activity = chat.last_activity;

    let caller = caller();

    let read_by: Vec<PayId> = if caller == from {
        vec![from_user.pay_id.clone()]
    } else if caller == to {
        vec![from_user.pay_id.clone()]
    } else {
        Vec::new()
    };

    let transaction = Transaction {
        sender_id: from_user.pay_id.clone(),
        timestamp,
        note: note.clone(),
        amount: amount.clone(),
        tx_id: tx_id.clone(),
        read_by,
    };
    chat.last_activity = transaction.timestamp;
    chat.messages
        .push(MessageOrTransaction::Transaction(transaction));

    // Update the ordering of the chat in the user's BTreeSet
    // from_user.my_chats.remove(&chat_id);
    // from_user.my_chats.insert(chat_id.clone());

    // to_user.my_chats.remove(&chat_id);
    // to_user.my_chats.insert(chat_id.clone());

    from_user
        .my_chats
        .remove(&(pre_last_activity, chat_id.clone()));
    from_user
        .my_chats
        .insert((chat.last_activity, chat_id.clone()));

    to_user
        .my_chats
        .remove(&(pre_last_activity, chat_id.clone()));
    to_user
        .my_chats
        .insert((chat.last_activity, chat_id.clone()));

    let tx_entry_from_user = TransactionEntry {
        kind: TxKind::Sends,            // for from its sending
        name: to_user.name.clone(),     // received by to
        pay_id: to_user.pay_id.clone(), // received by to
        tx_id: tx_id.clone(),
        timestamp,
        amount: amount.clone(),
        note: note.clone(),
    };

    let tx_entry_to_user = TransactionEntry {
        kind: TxKind::Receive,            // for to its receiveing
        name: from_user.name.clone(),     // send by from
        pay_id: from_user.pay_id.clone(), // send by from
        tx_id: tx_id.clone(),
        timestamp,
        amount,
        note,
    };

    match StoreHistory::get_history(&from) {
        Some(mut tx_history) => {
            tx_history.push(tx_entry_from_user);
            StoreHistory::insert_history(from, tx_history);
        }
        None => {
            let tx_history = vec![tx_entry_from_user];
            StoreHistory::insert_history(from, tx_history);
        }
    }

    match StoreHistory::get_history(&to) {
        Some(mut tx_history) => {
            tx_history.push(tx_entry_to_user);
            StoreHistory::insert_history(from, tx_history);
        }
        None => {
            let tx_history = vec![tx_entry_to_user];
            StoreHistory::insert_history(from, tx_history);
        }
    }

    Chats::insert(chat_id, chat);
    Users::insert(from, from_user);
    Users::insert(to, to_user);
}

pub fn add_user_business_transaction(
    UserBusinessTxArg {
        tx_id,
        amount,
        timestamp,
        b_principal,
        u_principal,
        note,
        tx_kind,
    }: UserBusinessTxArg,
) {
    // No need for second checking of Accounts, already checked in record_xfer_transaction function
    let mut user = Users::get(&u_principal).unwrap();
    let business = business::get_metadata(&b_principal).unwrap();

    let user_busi_id = create_key(&user.pay_id, &business.pay_id);

    let mut business_in_user = BusinessInUser::get(&user_busi_id).unwrap_or(BusinessInUser {
        id: user_busi_id.clone(),
        b_logo: business.logo.clone(),
        b_name: business.name.clone(),
        b_pay_id: business.pay_id.clone(),
        b_category: business.category,
        b_principal,
        transactions: Vec::new(),
        last_activity: time(),
    });

    let pre_last_activity = business_in_user.last_activity; //previous activity time

    let sender_id = match tx_kind {
        TxKind::Sends => user.pay_id.clone(),
        TxKind::Receive => business.pay_id.clone(),
    };
    let business_user_tx = BusinessUserTx {
        sender_id,
        timestamp,
        note: note.clone(),
        amount: amount.clone(),
        tx_id: tx_id.clone(),
    };

    business_in_user.transactions.push(business_user_tx);
    business_in_user.last_activity = timestamp; // update activity

    // Update the ordering of the business in User
    user.with_businesses
        .remove(&(pre_last_activity, user_busi_id.clone())); //remove
    user.with_businesses
        .insert((business_in_user.last_activity, user_busi_id.clone()));

    let tx_entry = TransactionEntry {
        kind: tx_kind.clone(),   // Based on User (if user send its send else receive)
        name: business.name,     // Business
        pay_id: business.pay_id, //Business
        tx_id: tx_id.clone(),
        timestamp,
        amount,
        note,
    };

    match StoreHistory::get_history(&u_principal) {
        Some(mut tx_history) => {
            tx_history.push(tx_entry);
            StoreHistory::insert_history(u_principal, tx_history);
        }
        None => {
            let tx_history = vec![tx_entry];
            StoreHistory::insert_history(u_principal, tx_history);
        }
    }

    BusinessInUser::insert(user_busi_id, business_in_user);
    Users::insert(u_principal, user);
}

pub fn add_unknown_transaction(
    UserUnknownTxArg {
        tx_id,
        u_principal,
        unknown,
        amount,
        timestamp,
        note,
        tx_kind,
    }: UserUnknownTxArg,
) {
    let tx_entry = TransactionEntry {
        kind: tx_kind,
        name: unknown.to_text(),
        pay_id: unknown.to_text(),
        tx_id,
        timestamp,
        amount,
        note,
    };

    match StoreHistory::get_history(&u_principal) {
        Some(mut tx_history) => {
            tx_history.push(tx_entry);
            StoreHistory::insert_history(u_principal, tx_history);
        }
        None => {
            let tx_history = vec![tx_entry];
            StoreHistory::insert_history(u_principal, tx_history);
        }
    }
}

// Fetch User metadata, latest transaction history 50, 8 chats and 4 businessInUser
pub fn fetch_init_user_data() -> UserData {
    let caller = caller();

    // cheked in parent fn
    let user = Users::get(&caller).unwrap();

    //Getting chats
    let mut chats = Vec::with_capacity(8);

    // for (_, chat_id) in user.my_chats.iter().rev().take(8) {
    //     match Chats::get(chat_id) {
    //         Some(chat) => chats.push(chat),
    //         None => continue,
    //     }
    // }
    for (_, chat_id) in user
        .my_chats
        .iter()
        .skip(if user.my_chats.len() > 8 {
            user.my_chats.len() - 8
        } else {
            0
        })
        .rev()
    {
        match Chats::get(chat_id) {
            Some(chat) => chats.push(chat),
            None => continue,
        }
    }

    // Getting Business In User
    let mut business = Vec::with_capacity(4);

    for (_, usr_bus_id) in user
        .with_businesses
        .iter()
        .skip(if user.with_businesses.len() > 4 {
            user.with_businesses.len() - 4
        } else {
            0
        })
        .rev()
    {
        match BusinessInUser::get(usr_bus_id) {
            Some(business_in_user) => business.push(business_in_user),
            None => continue,
        }
    }

    // Getting history
    // let history = StoreHistory::get_history(&caller)
    //     .unwrap_or_default()
    //     .into_iter()
    //     .rev()
    //     .take(50)
    //     .collect::<Vec<_>>();
    let history = StoreHistory::get_history(&caller).unwrap_or_default();
    let history_len = history.len();
    let history = history
        .into_iter()
        .skip(if history_len > 50 {
            history_len - 50
        } else {
            0
        })
        .rev()
        .collect::<Vec<_>>();

    UserData {
        user,
        history,
        business,
        chats,
    }
}

// fetch entire user data(metadata, tx history, chats, businessInChat)
pub fn fetch_user_data() -> UserData {
    let caller = caller();

    // cheked in parent fn
    let user = Users::get(&caller).unwrap();

    //Getting chats
    let mut chats = Vec::with_capacity(8);

    for (_, chat_id) in user.my_chats.iter().rev() {
        match Chats::get(chat_id) {
            Some(chat) => chats.push(chat),
            None => continue,
        }
    }

    // Getting Business In User
    let mut business = Vec::with_capacity(4);

    for (_, usr_bus_id) in user.with_businesses.iter().rev() {
        match BusinessInUser::get(usr_bus_id) {
            Some(business_in_user) => business.push(business_in_user),
            None => continue,
        }
    }

    // Getting history
    let history = StoreHistory::get_history(&caller)
        .unwrap_or_default()
        .into_iter()
        .rev()
        .collect::<Vec<_>>();

    UserData {
        user,
        history,
        business,
        chats,
    }
}

pub fn get_user() -> Option<User> {
    Users::get(&caller())
}

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize)]
pub struct ReqPayArg {
    chat_id: ChatId,
    amount: Nat,
    note: Option<String>,
}

pub fn request_payment(
    ReqPayArg {
        chat_id,
        amount,
        note,
    }: ReqPayArg,
) -> Result<RequestPayment, RequestPaymentError> {
    let caller = caller();

    //requester
    let mut user = match Users::get(&caller) {
        Some(user) => user,
        None => return Err(RequestPaymentError::AccountNotFound),
    };

    let mut chat = match Chats::get(&chat_id) {
        Some(chat) => chat,
        None => return Err(RequestPaymentError::ChatNotFound),
    };

    if !chat.participants.contains(&user.pay_id) {
        return Err(RequestPaymentError::NotAParticipant);
    }

    let pre_last_activity = chat.last_activity;
    let timestamp = time();
    let request_payment = RequestPayment {
        sender_id: user.pay_id.clone(), // requester payId
        amount,
        note,
        requested_at: timestamp,
        payment_at: None,
        tx_id: None,
        expires_at: get_24h_expiry(timestamp),
        read_by: vec![user.pay_id.clone()],
    };

    chat.messages.push(MessageOrTransaction::RequestPayment(
        request_payment.clone(),
    ));

    chat.last_activity = timestamp;

    // Update the ordering of the chat in the user's BTreeSet
    user.my_chats.remove(&(pre_last_activity, chat_id.clone()));
    user.my_chats.insert((chat.last_activity, chat_id.clone()));

    // Update the ordering of the chat in the user's BTreeSet
    for pay_id in &chat.participants {
        if pay_id == &user.pay_id {
            continue;
        }
        let principal = match PayIds::get(pay_id) {
            Some(principal) => principal,
            None => continue,
        };
        match Users::get(&principal) {
            Some(mut participant) => {
                participant
                    .my_chats
                    .remove(&(pre_last_activity, chat_id.clone()));
                participant
                    .my_chats
                    .insert((chat.last_activity, chat_id.clone()));
                Users::insert(principal, participant);
            }
            None => continue,
        }
    }

    Chats::insert(chat_id, chat);
    Users::insert(caller, user);

    Ok(request_payment)
}

pub struct RecordReqPayTxArg {
    pub from: Principal,
    pub to: Principal,
    pub timestamp: u64,
    pub amount: Nat,
    pub tx_id: Nat,
    pub chat_id: ChatId,
    pub message_index: usize,
    // is_read_by_sender: bool,
}

pub fn record_request_payment(
    RecordReqPayTxArg {
        from,
        to,
        timestamp,
        amount,
        tx_id,
        chat_id,
        message_index,
    }: RecordReqPayTxArg,
) -> Result<(), RecordRegPayTxErr> {


    let mut from_user = match Users::get(&from) {
        Some(user) => user,
        None => return Err(RecordRegPayTxErr::AccountNotFound),
    };

    let mut to_user = match Users::get(&to) {
        Some(user) => user,
        None => return Err(RecordRegPayTxErr::AccountNotFound),
    };

    // No need to pass chat Id
    // let chat_id = create_key(&from_user.pay_id, &to_user.pay_id);

    let mut chat = match Chats::get(&chat_id) {
        Some(chat) => chat,
        None => return Err(RecordRegPayTxErr::ChatNotFound),
    };

    if !chat.participants.contains(&from_user.pay_id) {
        return Err(RecordRegPayTxErr::NotAParticipant);
    }

    if !chat.participants.contains(&to_user.pay_id) {
        return Err(RecordRegPayTxErr::NotAParticipant);
    }

    let pre_last_activity = chat.last_activity;

    let req_pay    = match chat.messages.get_mut(message_index){
        Some(MessageOrTransaction::RequestPayment(req_pay)) => req_pay,
       _ => return Err(RecordRegPayTxErr::RequestPaymentNotFound),
    };

    /* We will add a 30 miniutes (1,800,000,000,000 nanoseconds) buffer to expiry time,
     Incase if user send payment in a time closes  to expiry time this will condition will return Expired error
     */
    if (req_pay.expires_at + 1_800_000_000_000) < timestamp{
        return Err(RecordRegPayTxErr::InvalidTransaction("Expired payment request".to_string()))
    }

    if req_pay.amount != amount{
        return Err(RecordRegPayTxErr::InvalidTransaction("Requested Amount is not equal to actual amount".to_string()));
    }

    // Payment requester is sender_id, 'to' is the payment receiver who requested payment
    if &req_pay.sender_id != &to_user.pay_id{
        return  Err(RecordRegPayTxErr::InvalidTransaction(format!("Requester {} is not the payment receiver {}", req_pay.sender_id, to_user.pay_id)));
    }

    req_pay.payment_at = Some(timestamp);
    req_pay.tx_id = Some(tx_id.clone());

    chat.last_activity = pre_last_activity;

    from_user
        .my_chats
        .remove(&(pre_last_activity, chat_id.clone()));
    from_user
        .my_chats
        .insert((chat.last_activity, chat_id.clone()));

    to_user
        .my_chats
        .remove(&(pre_last_activity, chat_id.clone()));
    to_user
        .my_chats
        .insert((chat.last_activity, chat_id.clone()));

        let tx_entry_from_user = TransactionEntry {
            kind: TxKind::Sends,            // for from its sending
            name: to_user.name.clone(),     // received by to
            pay_id: to_user.pay_id.clone(), // received by to
            tx_id: tx_id.clone(),
            timestamp,
            amount: amount.clone(),
            note: req_pay.note.clone(),
        };
    
        let tx_entry_to_user = TransactionEntry {
            kind: TxKind::Receive,            // for to its receiveing
            name: from_user.name.clone(),     // send by from
            pay_id: from_user.pay_id.clone(), // send by from
            tx_id: tx_id.clone(),
            timestamp,
            amount,
            note: req_pay.note.clone(),
        };


        match StoreHistory::get_history(&from) {
            Some(mut tx_history) => {
                tx_history.push(tx_entry_from_user);
                StoreHistory::insert_history(from, tx_history);
            }
            None => {
                let tx_history = vec![tx_entry_from_user];
                StoreHistory::insert_history(from, tx_history);
            }
        }
    
        match StoreHistory::get_history(&to) {
            Some(mut tx_history) => {
                tx_history.push(tx_entry_to_user);
                StoreHistory::insert_history(from, tx_history);
            }
            None => {
                let tx_history = vec![tx_entry_to_user];
                StoreHistory::insert_history(from, tx_history);
            }
        }


        Chats::insert(chat_id, chat);
        Users::insert(from, from_user);
        Users::insert(to, to_user);

    Ok(())
}

fn get_24h_expiry(nanosec_time: u64) -> u64 {
    const A_DAY: u64 = 86_400;
    const NANO_SEC: u64 = 1_000_000_000;

    let in_sec = nanosec_time / NANO_SEC;
    let seconds_in_time = in_sec % 60;

    let next_24h = in_sec - seconds_in_time + 86_400;

    next_24h * NANO_SEC
}
