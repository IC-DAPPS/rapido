use candid::{self, CandidType, Decode, Deserialize, Encode, Principal};
use ic_cdk::api::call::CallResult as Result;

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct Account {
    pub owner: Principal,
    pub subaccount: Option<serde_bytes::ByteBuf>,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct TransactionRange {
    pub transactions: Vec<Transaction>,
}

candid::define_function!(pub ArchivedRange1Callback : (GetBlocksRequest) -> (
    TransactionRange,
  ) query);
#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct ArchivedRange1 {
    pub callback: ArchivedRange1Callback,
    pub start: candid::Nat,
    pub length: candid::Nat,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct Burn {
    pub from: Account,
    pub memo: Option<serde_bytes::ByteBuf>,
    pub created_at_time: Option<u64>,
    pub amount: candid::Nat,
    pub spender: Option<Account>,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct Mint {
    pub to: Account,
    pub memo: Option<serde_bytes::ByteBuf>,
    pub created_at_time: Option<u64>,
    pub amount: candid::Nat,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct Approve {
    pub fee: Option<candid::Nat>,
    pub from: Account,
    pub memo: Option<serde_bytes::ByteBuf>,
    pub created_at_time: Option<u64>,
    pub amount: candid::Nat,
    pub expected_allowance: Option<candid::Nat>,
    pub expires_at: Option<u64>,
    pub spender: Account,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct Transfer {
    pub to: Account,
    pub fee: Option<candid::Nat>,
    pub from: Account,
    pub memo: Option<serde_bytes::ByteBuf>,
    pub created_at_time: Option<u64>,
    pub amount: candid::Nat,
    pub spender: Option<Account>,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct Transaction {
    pub burn: Option<Burn>,
    pub kind: String,
    pub mint: Option<Mint>,
    pub approve: Option<Approve>,
    pub timestamp: u64,
    pub transfer: Option<Transfer>,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct GetBlocksRequest {
    pub start: candid::Nat,
    pub length: candid::Nat,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct GetTransactionsResponse {
    pub first_index: candid::Nat,
    pub log_length: candid::Nat,
    pub transactions: Vec<Transaction>,
    pub archived_transactions: Vec<ArchivedRange1>,
}

pub async fn get_transactions(
    is_test: bool,
    tx_id: candid::Nat,
) -> Result<(GetTransactionsResponse,)> {
    let args = GetBlocksRequest {
        start: tx_id,
        length: candid::Nat::from(1u8),
    };
    let ck_test_btc_ledger = Principal::from_text("mc6ru-gyaaa-aaaar-qaaaq-cai").unwrap();
    let ck_btc_ledger = Principal::from_text("mxzaz-hqaaa-aaaar-qaada-cai").unwrap();
    let canister_id = if is_test {
        ck_test_btc_ledger
    } else {
        ck_btc_ledger
    };

    ic_cdk::call(canister_id, "get_transactions", (args,)).await
}
