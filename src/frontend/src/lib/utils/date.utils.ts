export const nowInBigIntNanoSeconds = (): bigint => BigInt(Date.now()) * BigInt(1e6);

export const getTodayMidnightTimestamp = (): number => {
	const now = new Date();
	const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	return todayMidnight.getTime();
};

export const getLastSevenDaysMidnightTimestamp = () => {
	const now = new Date();
	const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	return todayMidnight.getTime() - 7 * 24 * 60 * 60 * 1000;
};

export const get30DaysMidnightTimestamp = () => {
	const now = new Date();
	const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	return todayMidnight.getTime() - 30 * 24 * 60 * 60 * 1000;
};

// Outputs something like "Nov 26, 10:41 AM"
export function formatNanosecTimestamp(nanoseconds: number): string {
	// Convert nanoseconds to milliseconds (divide by 1,000,000)
	const timestamp = Math.floor(nanoseconds / 1_000_000);

	// Create a Date object
	const date = new Date(timestamp);

	// Define month names
	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	];

	// Format month
	const month = months[date.getMonth()];
	const day = date.getDate();

	// Format time
	let hours = date.getHours();
	const minutes = date.getMinutes().toString().padStart(2, '0');
	const ampm = hours >= 12 ? 'PM' : 'AM';

	// Convert to 12-hour format
	hours = hours % 12;
	hours = hours ? hours : 12; // handle midnight (0 hours)

	// Construct the final formatted string
	return `${month} ${day}, ${hours}:${minutes} ${ampm}`;
}
