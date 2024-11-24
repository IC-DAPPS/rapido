export function sanitizePayId(input: string) {
	// Convert to lowercase
	let sanitizedInput = input.toLowerCase();

	// Remove non-alphanumeric characters
	sanitizedInput = sanitizedInput.replace(/[^a-z0-9-]/g, '');

	return sanitizedInput;
}
