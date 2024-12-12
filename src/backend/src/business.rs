use crate::error::{GetBusinessError, SignUpError};
use crate::user::{self, is_user};
use crate::{is_payid_exist, PayIds, TransactionEntry, TxHistory, TxKind, BUSINESS_MAP};
use candid::{Decode, Encode, Nat, Principal};
use ic_cdk::{api::time, caller};
use ic_stable_structures::storable::{Bound, Storable};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use std::vec::Vec;

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize, PartialEq)]
pub enum BusinessCategory {
    Agriculture,    // Farming, forestry, fishing
    Manufacturing,  // Production of goods
    Technology,     // Software, IT services, hardware
    Retail,         // Shops, stores, e-commerce
    Food,           // Restaurants, cafes, food services
    Healthcare,     // Medical services, hospitals
    Education,      // Schools, training centers
    Finance,        // Banking, insurance, investments
    RealEstate,     // Property sales, rentals
    Construction,   // Building, renovation
    Transportation, // Logistics, delivery
    Entertainment,  // Media, arts, recreation
    Professional,   // Consulting, legal, accounting
    Hospitality,    // Hotels, tourism
    Energy,         // Oil, gas, renewable energy
    Other,          // Miscellaneous
}

impl Default for BusinessCategory {
    fn default() -> Self {
        BusinessCategory::Other
    }
}

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize, Default)]
pub struct Business {
    name: String,
    pay_id: String,
    logo: String,
    category: BusinessCategory,
    transactions: TxHistory,
    created_at: u64,
    // sub_category: String, // For more specific categorization
    // description: String,  // Brief business description
    // contact: ContactInfo,
    // updated_at: u64, // Timestamp
}

impl Storable for Business {
    const BOUND: Bound = Bound::Unbounded;
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

struct BusinessMap;

impl BusinessMap {
    fn get(key: &Principal) -> Option<Business> {
        BUSINESS_MAP.with(|p| p.borrow().get(&key))
    }

    fn get_mut(key: &Principal) -> Option<Business> {
        BUSINESS_MAP.with(|p| p.borrow_mut().get(&key))
    }

    fn insert(key: Principal, value: Business) -> Option<Business> {
        BUSINESS_MAP.with(|p| p.borrow_mut().insert(key, value))
    }

    fn remove(key: Principal) -> Option<Business> {
        BUSINESS_MAP.with(|p| p.borrow_mut().remove(&key))
    }

    fn contains_key(key: &Principal) -> bool {
        BUSINESS_MAP.with(|p| p.borrow().contains_key(key))
    }
}

#[derive(candid::CandidType, Clone, Serialize, Debug, Deserialize)]
pub struct BusinessSignUpArgs {
    name: String,
    pay_id: String,
    logo: String,
    category: BusinessCategory,
}

pub struct BusinessMetadata {
    pub name: String,
    pub pay_id: String,
    pub logo: String,
    pub category: BusinessCategory,
    pub created_at: u64,
}
pub struct BusinessTxArg {
    pub b_principal: Principal,
    pub u_principal: Principal,
    pub tx_kind: TxKind,
    pub amount: Nat,
    pub timestamp: u64,
    pub tx_id: Nat,
}

pub struct BtoBTxArg {
    pub from: Principal,
    pub to: Principal,
    pub timestamp: u64,
    pub note: Option<String>,
    pub amount: Nat,
    pub tx_id: Nat,
}

pub struct BusinessUnknownTxArg {
    pub tx_id: Nat,
    pub b_principal: Principal, // Business
    pub unknown: Principal,
    pub amount: Nat,
    pub timestamp: u64,
    pub note: Option<String>,
    pub tx_kind: TxKind, // Based on User (from or to)
}

// pub fn get_business(princpal: &Principal) -> Option<Business> {
//     BusinessMap::get(princpal)
// }

pub fn get_metadata(princpal: &Principal) -> Option<BusinessMetadata> {
    match BusinessMap::get(princpal) {
        Some(b) => Some(BusinessMetadata {
            name: b.name,
            pay_id: b.pay_id,
            logo: b.logo,
            category: b.category,
            created_at: b.created_at,
        }),
        None => None,
    }
}

pub fn is_business(princpal: &Principal) -> bool {
    BusinessMap::contains_key(princpal)
}

pub fn sign_up_business(arg: BusinessSignUpArgs) -> Result<(), SignUpError> {
    let caller: Principal = caller();

    if caller == Principal::anonymous() {
        return Err(SignUpError::AnonymousCaller);
    }
    if is_business(&caller) || is_user(&caller) {
        return Err(SignUpError::AccountExist);
    }
    if is_payid_exist(&arg.pay_id) {
        return Err(SignUpError::PayIdExist);
    }

    let pay_id = arg.pay_id.to_string();
    let business = Business {
        name: arg.name,
        pay_id: arg.pay_id,
        logo: arg.logo,
        category: arg.category,
        transactions: Vec::new(),
        created_at: time(),
    };
    BusinessMap::insert(caller, business);
    PayIds::insert(pay_id, caller);
    Ok(())
}

pub fn ic_get_business() -> Result<Business, GetBusinessError> {
    match BusinessMap::get(&caller()) {
        Some(business) => Ok(business),
        None => Err(GetBusinessError::AccountNotFound),
    }
}

pub fn add_business_transaction(
    BusinessTxArg {
        b_principal,
        u_principal,
        tx_kind,
        amount,
        timestamp,
        tx_id,
    }: BusinessTxArg,
) {
    // No need for second checking of Accounts, already checked in record_xfer_transaction function
    let mut business = BusinessMap::get(&b_principal).unwrap();
    let user = user::get_metadata(&u_principal).unwrap();

    let tx_entry = TransactionEntry {
        kind: tx_kind,
        name: user.name,
        pay_id: user.pay_id,
        timestamp,
        amount,
        tx_id,
        note: None,
    };

    business.transactions.push(tx_entry);
    BusinessMap::insert(b_principal, business);
}

pub fn add_business_to_business_transaction(
    BtoBTxArg {
        from,
        to,
        timestamp,
        note,
        amount,
        tx_id,
    }: BtoBTxArg,
) {
    // No need for second checking of Accounts, already checked in record_xfer_transaction function
    let mut from_business = BusinessMap::get(&from).unwrap();
    let mut to_business = BusinessMap::get(&to).unwrap();

    let tx_entry_from_business = TransactionEntry {
        kind: TxKind::Sends,                // from sends it
        name: to_business.name.clone(),     // to who
        pay_id: to_business.pay_id.clone(), // to who
        tx_id: tx_id.clone(),
        timestamp,
        amount: amount.clone(),
        note: note.clone(),
    };
    from_business.transactions.push(tx_entry_from_business);

    let tx_entry_to_business = TransactionEntry {
        kind: TxKind::Receive,                // to receive it
        name: from_business.name.clone(),     // from who
        pay_id: from_business.pay_id.clone(), // from who
        tx_id,
        timestamp,
        amount,
        note,
    };
    to_business.transactions.push(tx_entry_to_business);

    BusinessMap::insert(from, from_business);
    BusinessMap::insert(to, to_business);
}

pub fn add_unknown_transaction(
    BusinessUnknownTxArg {
        tx_id,
        b_principal,
        unknown,
        amount,
        timestamp,
        note,
        tx_kind,
    }: BusinessUnknownTxArg,
) {
    // No need for second checking of Accounts, already checked in record_xfer_transaction function
    let mut business = BusinessMap::get(&b_principal).unwrap();

    let tx_entry = TransactionEntry {
        kind: tx_kind,
        name: unknown.to_text(),
        pay_id: unknown.to_text(),
        tx_id,
        timestamp,
        amount,
        note,
    };

    business.transactions.push(tx_entry);
    BusinessMap::insert(b_principal, business);
}

pub fn fetch_init_business_data() -> Business {
    let mut business = BusinessMap::get(&caller()).unwrap();

    let length = business.transactions.len();

    // latest first order
    business.transactions = business
        .transactions
        .into_iter()
        .skip(if length > 50 { length - 50 } else { 0 })
        .rev()
        .collect::<Vec<_>>();

    business
}

pub fn fetch_business_data() -> Business {
    let mut business = BusinessMap::get(&caller()).unwrap();

    let length = business.transactions.len();

    // latest first order
    business.transactions = business.transactions.into_iter().rev().collect::<Vec<_>>();

    business
}

// Here length argument is the lenghth of transaction history array fetch already in frontend
pub fn get_new_business_transactions(length: usize) -> Vec<TransactionEntry> {
    let business = match BusinessMap::get(&caller()) {
        Some(b) => b,
        None => return Vec::new(),
    };

    // latest first order
    business.transactions[length..]
        .to_vec()
        .into_iter()
        .rev()
        .collect::<Vec<_>>()
}
