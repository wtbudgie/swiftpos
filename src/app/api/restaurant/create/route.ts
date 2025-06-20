/**
 * File: createRestaurant.ts
 * Description: API route handler to create a default restaurant for an owner in SwiftPOS.
 *              Includes admin authorization, validation of input, and inserting default restaurant data.
 * Author: William Anderson
 * Created: 2025-06-19
 */

import { NextRequest } from "next/server";
import client from "@/utils/db";
import { auth } from "@/utils/auth";
import { Restaurant } from "@/types/RestaurantType";

const DEFAULT_IMAGE = "https://www.svgrepo.com/show/508699/landscape-placeholder.svg";
const ADMIN_EMAILS = ["maniakwill@gmail.com"];

/**
 * Function: isUserAdmin
 * Input:
 * - session: any — authenticated user session object
 * Output:
 * - boolean — true if session user email is in admin list, false otherwise
 * Description:
 * Checks if the authenticated user is an admin by comparing email against ADMIN_EMAILS.
 */
function isUserAdmin(session: any): boolean {
	return !!session?.user?.email && ADMIN_EMAILS.includes(session.user.email);
}

/**
 * Function: getValidOwnerId
 * Input:
 * - req: NextRequest — incoming HTTP request object
 * Output:
 * - string | null — returns valid ownerId string from query params or null if invalid
 * Description:
 * Extracts and validates the ownerId parameter from the request URL query string.
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
 * Function: createDefaultRestaurant
 * Input:
 * - ownerId: string — owner user ID to associate with new restaurant
 * - timestamp: number — current timestamp used to generate unique IDs for nested objects
 * Output:
 * - Restaurant — returns a Restaurant object populated with default values and IDs
 * Description:
 * Constructs a default restaurant structure with placeholders for categories, items, modifications, and dietaries.
 * This ensures a newly created restaurant has a valid initial schema.
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
 * Function: GET
 * Input:
 * - req: NextRequest — incoming HTTP GET request
 * Output:
 * - Promise<Response> — HTTP response containing creation result or error message
 * Description:
 * Handles the API endpoint to create a new restaurant.
 * - Verifies admin authorization
 * - Validates the ownerId query parameter
 * - Inserts a new default restaurant record into the database
 * - Returns the new restaurant ID and access URL on success
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

/**
 * Testing Notes:
 * - Verify admin session required for access (401 Unauthorized or 403 Forbidden responses).
 * - Test valid and invalid ownerId query parameters.
 * - Confirm default restaurant document is inserted with correct structure.
 * - Validate response includes restaurantId, ownerId, ownerEmail, and access URL.
 *
 * Future Enhancements:
 * - Add detailed validation on restaurant fields before insertion.
 * - Support custom restaurant data from client input.
 * - Implement logging for failed insert operations.
 */
