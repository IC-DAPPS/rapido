import { getAgent } from '$lib/actors/agents.ic';
import type { CreateCanisterOptions } from '$lib/types/canister';
import { CkBTCMinterCanister } from '@dfinity/ckbtc';
import type { _SERVICE as CkBTCMinterService } from '@dfinity/ckbtc/dist/candid/minter';

export const getCkBTCMinterCanister = async ({
	identity,
	...options
}: CreateCanisterOptions<CkBTCMinterService>): Promise<CkBTCMinterCanister> => {
	const agent = await getAgent({ identity });

	return CkBTCMinterCanister.create({ agent, ...options });
};
