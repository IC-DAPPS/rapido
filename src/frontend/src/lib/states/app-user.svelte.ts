import type { AppUser, AppUserCategoryKey } from '$lib/types/states';
import type { Business, User } from '@declarations/backend/backend.did';

export const user = $state<AppUser>({
	avatar: '',
	name: '',
	created_at: 0,
	category: 'NONE',
	pay_id: ''
});

export const setAppUser = (profile: Business | User) => {
	if ('logo' in profile) {
		//Business
		user.avatar = profile.logo;
		user.name = profile.name;
		user.created_at = Number(profile.created_at);
		user.category = Object.keys(profile.category)[0] as AppUserCategoryKey;
		user.pay_id = profile.pay_id;
	} else {
		// user
		user.avatar = profile.profile_pic;
		user.name = profile.name;
		user.created_at = Number(profile.created_at);
		user.category = 'USER';
		user.pay_id = profile.pay_id;
	}
};
