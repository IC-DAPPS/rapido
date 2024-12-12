import type { TransactionEntry } from '@declarations/backend/backend.did';

export const transaction = $state({
	history: [] as Array<TransactionEntry>
});
