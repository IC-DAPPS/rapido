import { parseBtcAddress, type BtcAddress } from '@dfinity/ckbtc';

/**
 * Is the address a valid entry to proceed with?
 *
 * e.g. this check is used in the Send / convert ckBTC to test if an address is a valid Bitcoin address
 */
export const invalidBtcAddress = (address: BtcAddress): boolean => {
	try {
		parseBtcAddress(address);
	} catch (_: unknown) {
		return true;
	}

	return false;
};
