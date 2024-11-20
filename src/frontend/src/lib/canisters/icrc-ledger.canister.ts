import { getAgent } from '$lib/actors/agents.ic';
import type { CreateCanisterOptions } from '$lib/types/canister';
import { IcrcLedgerCanister } from '@dfinity/ledger-icrc';
import type { _SERVICE as IcrcLedgerService } from '@dfinity/ledger-icrc/dist/candid/icrc_ledger';

export const getIcrcLedgerCanister = async ({
	identity,
	...options
}: CreateCanisterOptions<IcrcLedgerService>): Promise<IcrcLedgerCanister> => {
	const agent = await getAgent({ identity });

	return IcrcLedgerCanister.create({ agent, ...options });
};
