use candid::Principal;
use serde::{Deserialize, Serialize};

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize)]
pub enum SignUpError {
    AnonymousCaller,
    AccountExist,
    PayIdExist,
}

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize)]
pub enum GetBusinessError {
    AccountNotFound,
}

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize)]
pub enum CreateChatErr {
    AccountNotFound,
    CallerAndParticipantSame,
    ParticipantNotFound,
}

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize)]
pub enum AddMessageErr {
    AccountNotFound,
    ChatNotFound,
    NotAParticipant,
}

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize)]
pub enum MarkMessageReadErr {
    ChatNotFound,
    NotAParticipant,
    AccountNotFound,
}

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize)]
pub enum AddBusinessError {
    AccountNotFound,
    BusinessNotFound,
}

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize)]
pub enum RecordTxErr {
    InterCanisterCall(String),
    FailedTo,
    InvalidTransaction(String),
    BothAccountsNotFound { from: Principal, to: Principal },
    AlreadyRecorded,
}

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize)]
pub enum FetchInitDataError {
    AnonymousCaller,
}
