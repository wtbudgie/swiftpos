import { NextRequest } from "next/server";

import client from "@/utils/db";
import { auth } from "@/utils/auth";

import { User } from "@/types/UserType";

export async function PUT(req: NextRequest) {
	const session = await auth();

	if (!session || !session.user?.email) {
		return new Response(JSON.stringify({ message: "Unauthorised.", user: null }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	const db = client.db("SwiftPOS");

	let body;
	try {
		body = await req.json();
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ message: "Invalid JSON body.", user: null }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const { firstName, secondName, phoneNumber, onboarded } = body;

	if (typeof firstName !== "string" || typeof secondName !== "string" || typeof phoneNumber !== "string") {
		return new Response(JSON.stringify({ message: "Missing or invalid fields.", user: null }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}

	const updateResult = await db.collection<User>("users").findOneAndUpdate(
		{ email: session.user.email },
		{
			$set: {
				firstName,
				secondName,
				phoneNumber,
				...(typeof onboarded === "boolean" ? { onboarded } : {}),
			},
		},
		{ returnDocument: "after" }
	);

	if (!updateResult || !updateResult) {
		return new Response(JSON.stringify({ message: "User not found.", user: null }), {
			status: 404,
			headers: { "Content-Type": "application/json" },
		});
	}

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
