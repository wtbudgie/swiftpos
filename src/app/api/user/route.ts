/**
 * File: updateUser.ts
 * Description: API route handler for updating user profile information in SwiftPOS.
 * Author: William Anderson
 */

import { NextRequest } from "next/server";

import client from "@/utils/db";
import { auth } from "@/utils/auth";

import { User } from "@/types/UserType";

/**
 * Function: PUT
 * Input:
 * - req: NextRequest — HTTP request object containing JSON body with user profile fields
 *   Expected JSON body:
 *   {
 *     firstName: string,
 *     secondName: string,
 *     phoneNumber: string,
 *     onboarded?: boolean
 *   }
 *
 * Output:
 * - Response — HTTP response containing JSON with status message and updated user data (User type)
 *
 * Description:
 * Handles updating user profile information for the authenticated user.
 * Steps:
 * 1. Authenticates user session, returns 401 if unauthorized.
 * 2. Parses JSON body; returns 400 if invalid JSON or missing/invalid fields.
 * 3. Updates the user's document in the "users" collection identified by email.
 * 4. Optionally updates "onboarded" status if boolean is provided.
 * 5. Returns 404 if user not found.
 * 6. Returns 200 with updated user data on success.
 */
export async function PUT(req: NextRequest) {
	// Authenticate user session and verify email presence
	const session = await auth();

	if (!session || !session.user?.email) {
		return new Response(JSON.stringify({ message: "Unauthorised.", user: null }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Connect to SwiftPOS database
	const db = client.db("SwiftPOS");

	let body;
	try {
		// Attempt to parse JSON body from request
		body = await req.json();
	} catch (error) {
		// Invalid JSON in request body
		console.error(error);
		return new Response(JSON.stringify({ message: "Invalid JSON body.", user: null }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const { firstName, secondName, phoneNumber, onboarded } = body;

	// Validate required fields are strings
	if (typeof firstName !== "string" || typeof secondName !== "string" || typeof phoneNumber !== "string") {
		return new Response(JSON.stringify({ message: "Missing or invalid fields.", user: null }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Update user document by email, returning updated document after change
	const updateResult = await db.collection<User>("users").findOneAndUpdate(
		{ email: session.user.email },
		{
			$set: {
				firstName,
				secondName,
				phoneNumber,
				// Only include onboarded field if it's explicitly a boolean
				...(typeof onboarded === "boolean" ? { onboarded } : {}),
			},
		},
		{ returnDocument: "after" }
	);

	// Return 404 if no user was found and updated
	if (!updateResult) {
		return new Response(JSON.stringify({ message: "User not found.", user: null }), {
			status: 404,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Success response with updated user document
	return new Response(
		JSON.stringify({
			message: "User updated successfully.",
			user: updateResult,
		}),
		{
			status: 200,
			headers: { "Content-Type": "application/json" },
		}
	);
}

/**
 * Testing Notes:
 * - Authenticate as a valid user and send PUT request with valid JSON body, verify 200 and updated user data.
 * - Send PUT request without authentication, expect 401 Unauthorized response.
 * - Send invalid JSON body, expect 400 response.
 * - Send valid JSON body missing required string fields, expect 400 response.
 * - Test updating with and without the optional onboarded boolean.
 * - Test with non-existent user email, expect 404 response.
 */
