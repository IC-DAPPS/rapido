import type { Identity } from '@dfinity/agent';

export const isIdentityNotEqual = (identity1: Identity, identity2: Identity): boolean => {
	return 'eq' !== identity1.getPrincipal().compareTo(identity2.getPrincipal());
};
