import { goto } from '$app/navigation';
import { fetchAllData } from '$lib/api/backend.api';
import type { Identity } from '@dfinity/agent';
import { setAppUser } from '@states/app-user.svelte';
import { transaction } from '@states/history.svelte';

export const navigation = async (identity: Identity) => {
	const response = await fetchAllData({ identity });

	if ('Ok' in response) {
		const dataReponse = response.Ok;
		console.log(dataReponse);
		if ('Business' in dataReponse) {
			// set Business init data
			setAppUser(dataReponse.Business);
			transaction.history = dataReponse.Business.transactions;
			goto('/business');
		} else if ('User' in dataReponse) {
			// set user init data
			setAppUser(dataReponse.User.user);
			transaction.history = dataReponse.User.history;
			goto('/user');
		} else {
			goto('/signup');
		}
	}
};
