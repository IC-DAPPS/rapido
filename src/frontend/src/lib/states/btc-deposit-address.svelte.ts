import type { Option } from '$lib/types/utils';

export const btcDepositAddress: { address: Option<string> } = $state({
	address: undefined
});
