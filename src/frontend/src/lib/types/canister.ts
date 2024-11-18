import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import type { CanisterOptions } from '@dfinity/utils';
import type { OptionIdentity } from './identity';

export interface CreateCanisterOptions<T> extends Omit<CanisterOptions<T>, 'canisterId' | 'agent'> {
	canisterId: Principal;
	identity: Identity;
}

export type CommonCanisterApiFunctionParams<T = unknown> = T & {
	nullishIdentityErrorMessage?: string;
	identity: OptionIdentity;
	canisterId?: string;
};
