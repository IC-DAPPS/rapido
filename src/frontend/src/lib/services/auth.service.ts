import { authStore, type AuthSignInParams } from '@stores/auth.store';
import { i18n } from '@stores/i18n.store';
import { toast } from 'svelte-sonner';
import { get } from 'svelte/store';

export const signIn = async (params: AuthSignInParams) => {
	const toastId = toast.loading(get(i18n).auth.notify.loading);
	try {
		await authStore.signIn(params);

		toast.success(get(i18n).auth.notify.success, {
			id: toastId
		});
	} catch (err: unknown) {
		if (err === 'UserInterrupt') {
			toast.error(get(i18n).auth.notify.canceled, {
				id: toastId
			});
		}
		console.error(err);
		toast.error(get(i18n).auth.notify.error, {
			id: toastId
		});
	}
};

export const signOut = async () => {
	await authStore.signOut();
	toast.success(get(i18n).auth.notify.sign_out);
};
