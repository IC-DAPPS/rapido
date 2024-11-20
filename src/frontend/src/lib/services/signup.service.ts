import { isPayIdAvailable, signUp } from '$lib/api/backend.api';
import type { ResultSuccess } from '$lib/types/utils';
import type { BusinessCategory } from '@declarations/backend/backend.did';
import { isNullish } from '@dfinity/utils';
import { authStore } from '@stores/auth.store';
import { toast } from 'svelte-sonner';
import { get } from 'svelte/store';

let toastId: string | number;

export const isPayIdAvailableSearch = async (payId: string): Promise<boolean> => {
	try {
		const { identity } = get(authStore);
		if (isNullish(identity)) {
			toastId = toast.info('Please authenticate with Internet Identity', {
				id: toastId
			});
			return false;
		}
		return await isPayIdAvailable({ identity, payId });
	} catch (err) {
		console.error(err);
		toastId = toast.info('Something went wrong while searching Pay Id', {
			id: toastId
		});

		return false;
	}
};

export const signUpIndividual = async ({
	name,
	payId
}: {
	name: string;
	payId: string;
}): Promise<ResultSuccess> => {
	try {
		const { identity } = get(authStore);
		if (isNullish(identity)) {
			toastId = toast.info('Please authenticate with Internet Identity', {
				id: toastId
			});
			return { success: false };
		}

		const singUpArg = {
			User: { name, pay_id: payId, profile_pic: '' }
		};

		const response = await signUp({ identity, signUpArg: singUpArg });

		if ('Ok' in response) return { success: true };

		const err = response.Err;

		if ('AccountExist' in err) {
			toastId = toast.info('Account already exist!.', {
				id: toastId
			});
		} else if ('PayIdExist' in err) {
			toastId = toast.error('Pay Id is not available.', {
				id: toastId
			});
		} else if ('AnonymousCaller' in err) {
			toastId = toast.info('Please authenticate with Internet Identity.', {
				id: toastId
			});
		}

		return { success: false };
	} catch (error) {
		console.error(error);
		toastId = toast.error('Something went wrong while signing up', {
			id: toastId
		});
		return { success: false };
	}
};

export const signUpBusiness = async ({
	name,
	payId,
	category
}: {
	name: string;
	category: BusinessCategory;
	payId: string;
}): Promise<ResultSuccess> => {
	try {
		const { identity } = get(authStore);
		if (isNullish(identity)) {
			toastId = toast.info('Please authenticate with Internet Identity', {
				id: toastId
			});
			return { success: false };
		}

		const singUpArg = {
			Business: { name, pay_id: payId, category, logo: '' }
		};

		const response = await signUp({ identity, signUpArg: singUpArg });

		if ('Ok' in response) return { success: true };

		const err = response.Err;

		if ('AccountExist' in err) {
			toastId = toast.info('Account already exist!.', {
				id: toastId
			});
		} else if ('PayIdExist' in err) {
			toastId = toast.error('Pay Id is not available.', {
				id: toastId
			});
		} else if ('AnonymousCaller' in err) {
			toastId = toast.info('Please authenticate with Internet Identity.', {
				id: toastId
			});
		}

		return { success: false };
	} catch (error) {
		console.error(error);
		toastId = toast.error('Something went wrong while signing up', {
			id: toastId
		});
		return { success: false };
	}
};
