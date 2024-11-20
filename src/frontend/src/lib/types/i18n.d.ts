import type { Languages } from './languages';

interface I18nAuth {
	notify: {
		loading: string;
		success: string;
		canceled: string;
		error: string;
		sign_out: string;
	};
	text: {
		authenticate: string;
		logout: string;
	};
}

interface I18nNavigation {
	home: string;
	transactions: string;
	portfolio: string;
	story: string;
}

interface I18nUserdata {
	text: {
		profile_setup_title: string;
		continue: string;
		name: string;
		email: string;
		add_new_form: string;
		submit: string;
		skip: string;
		principal: string;
		principal_alias: string;
		add_owned_principal_description: string;
		add_known_principal_description: string;
	};
	assertion: {
		name_required: string;
		email_invalid: string;
		principal_alias_name_minimum: string;
		principal_alias_name_maximum: string;
		principal_invalid: string;
		unique_principal: string;
	};
	placeholder: {
		name: string;
		email: string;
		principal: string;
		alias_name: string;
	};
	error: {
		fetch: string;
		no_userdata_found: string;
		anonymous_user: string;
		error: string;
		principal_conversion_error: string;
	};
}

interface I18nTransactions {
	error: { sync: string };
}

interface I18n {
	lang: Languages;
	auth: I18nAuth;
	navigation: I18nNavigation;
	userdata: I18nUserdata;
	transactions: I18nTransactions;
}
