import { getAgent } from '$lib/actors/agents.ic';
import { IcrcIndexNgCanister } from '@dfinity/ledger-icrc';
import type { _SERVICE as IcrcIndexNgService } from '@dfinity/ledger-icrc/dist/candid/icrc_index-ng';
import type { CreateCanisterOptions } from '$lib/types/canister';

export const getIcrcIndexNgCanister = async ({
	identity,
	...optiona
}: CreateCanisterOptions<IcrcIndexNgService>): Promise<IcrcIndexNgCanister> => {
	const agent = await getAgent({ identity });

	return IcrcIndexNgCanister.create({
		agent,
		...optiona
	});
};
