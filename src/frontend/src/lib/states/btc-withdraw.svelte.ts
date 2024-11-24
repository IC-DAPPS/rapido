import type { MinterInfo } from '@dfinity/ckbtc';

export const minterInfo: {
	retrieve_btc_min_amount: number;
	min_confirmations: number;
	kyt_fee: number;
} = $state({
	retrieve_btc_min_amount: 0,
	min_confirmations: 0,
	kyt_fee: 0
});

export const withdrawalFee: {
	minter_fee: number;
	bitcoin_fee: number;
} = $state({
	minter_fee: 0,
	bitcoin_fee: 0
});
