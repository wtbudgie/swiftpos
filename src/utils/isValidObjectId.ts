export function isValidObjectId(input: any) {
	if (typeof input === "string") {
		return /^[a-fA-F0-9]{24}$/.test(input);
	}
	if (input instanceof Uint8Array) {
		return input.length === 12;
	}
	if (typeof input === "number" && Number.isInteger(input)) {
		return true;
	}
	return false;
}
