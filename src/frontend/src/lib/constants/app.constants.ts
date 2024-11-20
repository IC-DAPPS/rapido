export const INTERNET_IDENTITY_CANISTER_ID =
	(import.meta.env.VITE_INTERNET_IDENTITY_CANISTER_ID as string) ?? 'rdmx6-jaaaa-aaaaa-aaadq-cai';

export const BACKEND_CANISTER_ID = import.meta.env.VITE_BACKEND_CANISTER_ID as string;
export const CKBTC_INDEX_CANISTER_ID = 'n5wcd-faaaa-aaaar-qaaea-cai';
export const CKBTC_LEDGER_CANISTER_ID = 'mxzaz-hqaaa-aaaar-qaada-cai';
export const CKBTC_MINTER_CANISTER_ID = 'mqygn-kiaaa-aaaar-qaadq-cai';

export const CKBTC_TEST_INDEX_CANISTER_ID = 'mm444-5iaaa-aaaar-qaabq-cai';
export const CKBTC_TEST_LEDGER_CANISTER_ID = 'mc6ru-gyaaa-aaaar-qaaaq-cai';
export const CKBTC_TEST_MINTER_CANISTER_ID = 'ml52i-qqaaa-aaaar-qaaba-cai';

export const Network = import.meta.env.VITE_DFX_NETWORK as 'local' | 'ic';

export const HOST = import.meta.env.VITE_HOST as string;
export const LOCAL = Network === 'local';
export const PROD = Network === 'ic';

// How long the delegation identity should remain valid?
// e.g. BigInt(60 * 60 * 1000 * 1000 * 1000) = 1 hour in nanoseconds
export const AUTH_MAX_TIME_TO_LIVE = BigInt(60 * 60 * 1000 * 1000 * 1000);

export const AUTH_POPUP_WIDTH = 576;
export const AUTH_POPUP_HEIGHT = 625;
