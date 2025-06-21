/**
 * Function: isValidObjectId
 *
 * Description:
 * Validates whether an input can be a valid MongoDB ObjectId.
 * Supports multiple input types including strings, Uint8Array, and numbers.
 *
 * @param input - The value to validate as a potential ObjectId
 * @returns boolean - True if the input could be a valid ObjectId, false otherwise
 *
 * Behavior:
 * - For strings: Validates 24-character hex format
 * - For Uint8Array: Validates 12-byte length
 * - For numbers: Validates integer values (MongoDB accepts numbers as _id)
 * - Returns false for all other types
 */
export function isValidObjectId(input: unknown): boolean {
	// String validation (24-character hex)
	if (typeof input === "string") {
		return /^[a-fA-F0-9]{24}$/.test(input);
	}

	// Uint8Array validation (12-byte buffer)
	if (input instanceof Uint8Array) {
		return input.length === 12;
	}

	// Number validation (integer)
	if (typeof input === "number" && Number.isInteger(input)) {
		return true;
	}

	// All other types are invalid
	return false;
}

/**
 * Testing Notes:
 * - Verify correct validation of 24-character hex strings
 * - Test with both uppercase and lowercase hex characters
 * - Validate 12-byte Uint8Array inputs
 * - Check integer number validation
 * - Test edge cases:
 *   - Empty string
 *   - 23/25 character strings
 *   - 11/13 byte Uint8Array
 *   - Non-integer numbers
 *   - Non-hex characters
 *   - Null/undefined inputs
 *   - Object inputs
 */
