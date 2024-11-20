import { goto } from '$app/navigation';
import { fetchAllData } from '$lib/api/backend.api';
import type { Identity } from '@dfinity/agent';

export const navigation = async (identity: Identity) => {
	const response = await fetchAllData({ identity });

	if ('Ok' in response) {
		const dataReponse = response.Ok;
		console.log(dataReponse);
		if ('Business' in dataReponse) {
			// set Business init data
			goto('/business');
		} else if ('User' in dataReponse) {
			// set user init data
			goto('/user');
		} else {
			goto('/signup');
		}
	}
};
