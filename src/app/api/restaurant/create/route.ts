/**
 * File: createDefaultRestaurant.ts
 * Description: Server-side API route to create a default restaurant entry in the SwiftPOS database.
 *              This function validates session access and ownership before inserting a pre-defined restaurant object.
 * Author: William Anderson
 */

import { NextRequest } from "next/server";
import client from "@/utils/db";
import { auth } from "@/utils/auth";
import { Restaurant } from "@/types/RestaurantType";

// --- Configuration ---
const DEFAULT_IMAGE = "https://www.svgrepo.com/show/508699/landscape-placeholder.svg";
const ADMIN_EMAILS = ["maniakwill@gmail.com"];

/**
 * Determines if the user sending the request is a admin.
 *
 * @param {any} session - The active session.
 * @returns {boolean} - True/false if the user is an admin.
 */
function isUserAdmin(session: any): boolean {
	return !!session?.user?.email && ADMIN_EMAILS.includes(session.user.email);
}

/**
 * Validates the ownerId parameter from the URL query.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {string | null} - Validated ownerId
 */
function getValidOwnerId(req: NextRequest): string | null {
	const url = new URL(req.url);
	const ownerId = url.searchParams.get("ownerId");
	if (!ownerId || typeof ownerId !== "string" || ownerId.trim() === "") {
		return null;
	}
	return ownerId;
}

/**
 * Creates a new default Restaurant object.
 *
 * @param {string} ownerId - The ownerId of the restaurant
 * @param {string} timestamp - The timestamp of creating the restaurant.
 * @returns {Restaurant} Default restaurant object.
 */
function createDefaultRestaurant(ownerId: string, timestamp: number): Restaurant {
	const defaultItemId = `itm-${timestamp}`;
	const defaultCategoryId = `cat-${timestamp}`;
	const ingredientId = `ing-${timestamp}`;
	const modificationId = `mod-${timestamp}`;
	const optionId = `opt-${timestamp}`;

	return {
		name: "Default Restaurant Name",
		description: "A default restaurant description",
		ownerId,
		employeeIds: [],
		activeOrders: [],
		categories: [
			{
				id: defaultCategoryId,
				name: "Default Category",
				description: "Default category description",
				itemIds: [defaultItemId],
			},
		],
		items: [
			{
				id: defaultItemId,
				categoryId: defaultCategoryId,
				name: "Default Item",
				description: "Default item description",
				price: 10.0,
				ingredients: [{ id: ingredientId, name: "Ingredient 1", quantity: "100g" }],
				stockAmount: "infinite",
				modifications: [
					{
						id: modificationId,
						name: "Extras",
						options: [{ id: optionId, name: "Cheese", priceModifier: 1.5 }],
						maxSelectable: 2,
						required: false,
					},
				],
				dietaries: ["G/F"],
				imageUrl: DEFAULT_IMAGE,
				isActive: true,
			},
		],
		dietaries: ["G/F"],
		address: "123 Default St, City, State, ZIP",
		contactEmail: "contact@defaultrestaurant.com",
		phoneNumber: "123-456-7890",
		imageUrl: DEFAULT_IMAGE,
	};
}

/**
 * Handles a GET request to create a default restaurant entry for a specified owner.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<Response>} JSON response indicating success or failure.
 */
export async function GET(req: NextRequest): Promise<Response> {
	const session = await auth();

	if (!isUserAdmin(session)) {
		const message = !session?.user?.email ? "Unauthorized" : "Forbidden";
		return new Response(JSON.stringify({ message }), { status: !session?.user?.email ? 401 : 403 });
	}

	const ownerId = getValidOwnerId(req);
	if (!ownerId) {
		return new Response(JSON.stringify({ message: "Missing or invalid ownerId query parameter" }), { status: 400 });
	}

	const db = client.db("SwiftPOS");
	const collection = db.collection("restaurants");

	const timestamp = Date.now();
	const newRestaurant = createDefaultRestaurant(ownerId, timestamp);
	const insertResult = await collection.insertOne(newRestaurant);

	if (!insertResult.acknowledged) {
		return new Response(JSON.stringify({ message: "Failed to create restaurant" }), { status: 500 });
	}

	const createdRestaurantId = insertResult.insertedId.toString();

	return new Response(
		JSON.stringify({
			restaurantId: createdRestaurantId,
			ownerId,
			ownerEmail: session?.user.email,
			restaurantAccess: `/restaurant/${createdRestaurantId}/admin`,
		}),
		{ status: 201, headers: { "Content-Type": "application/json" } }
	);
}
