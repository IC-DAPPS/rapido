import type { BusinessCategory } from '@declarations/backend/backend.did';

// type BusinessCategoryKey = keyof BusinessCategory;

export type AppUserCategoryKey =
	| 'Healthcare'
	| 'RealEstate'
	| 'Food'
	| 'Energy'
	| 'Retail'
	| 'Professional'
	| 'Technology'
	| 'Entertainment'
	| 'Transportation'
	| 'Other'
	| 'Agriculture'
	| 'Education'
	| 'Finance'
	| 'Hospitality'
	| 'Construction'
	| 'Manufacturing'
	//// added for shared state variable for user and business
	| 'USER'
	| 'NONE';

// example usage
// let fdfd: BusinessCategory = { Agriculture: null };
// let dfdfd: AppUserCategoryKey = Object.keys(fdfd)[0] as AppUserCategoryKey;

export interface AppUser {
	avatar: string;
	name: string;
	created_at: number;
	category: AppUserCategoryKey;
	pay_id: string;
}

// export interface User {
// 	// 'my_chats' : Array<[bigint, string]>,
// 	name: string;
// 	created_at: bigint;
// 	// 'with_businesses' : Array<[bigint, string]>,
// 	avatar: string;
// 	pay_id: string;
// }

// export interface User {
// 	my_chats: Array<[bigint, string]>;
// 	name: string;
// 	created_at: bigint;
// 	with_businesses: Array<[bigint, string]>;
// 	profile_pic: string;
// 	pay_id: string;
// }

// export interface Business {
// 	logo: string;
// 	name: string;
// 	created_at: bigint;
// 	category: BusinessCategory;
// 	transactions: Array<TransactionEntry>;
// 	pay_id: string;
// }
