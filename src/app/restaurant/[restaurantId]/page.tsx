/**
 * File: RestaurantPage.tsx
 * Description: Server-side page component that fetches and renders public restaurant data.
 *              Redirects to homepage if the specified restaurant does not exist.
 * Author: William Anderson
 */

import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";

import client from "@/utils/db";
import { auth } from "@/utils/auth";

import { Category, Item } from "@/types/RestaurantType";
import RestaurantLayout from "@/layouts/restaurantPage/RestaurantLayout";

/**
 * Interface: ReturnedRestaurant
 * Input:
 * - _id: string — MongoDB ObjectId string of the restaurant
 * - name: string — Name of the restaurant
 * - description: string — Brief description of the restaurant
 * - ownerId: string — ID of the restaurant owner
 * - categories: Category[] — Array of category objects the restaurant has
 * - items: Item[] — Array of menu items available
 * - dietaries: string[] — Array of dietary tags applicable to the restaurant's items
 * Output:
 * - Typed object representing a subset of restaurant data fetched from the database
 *
 * Description:
 * Defines the shape of the restaurant data exposed publicly by this page, restricting fields for security.
 */
export interface ReturnedRestaurant {
	_id: string;
	name: string;
	description: string;
	ownerId: string;
	categories: Category[];
	items: Item[];
	dietaries: string[];
}

/**
 * Type: Params
 * Input:
 * - Promise resolving to an object with restaurantId as string
 * Output:
 * - Used for typing the async route params for Next.js dynamic routes
 *
 * Description:
 * Represents the dynamic route parameter expected to fetch restaurant data.
 */
type Params = Promise<{ restaurantId: string }>;

/**
 * Function: RestaurantPage
 * Input:
 * - params: object containing Promise-resolved route parameters with restaurantId string
 * Output:
 * - JSX.Element rendering RestaurantLayout if restaurant data found, or redirect to home if not
 *
 * Description:
 * Server component that:
 * 1. Authenticates user session (optional)
 * 2. Retrieves restaurant data by ID
 * 3. Redirects to homepage if no restaurant found
 * 4. Passes fetched restaurant data and session to RestaurantLayout for rendering
 */
export default async function RestaurantPage({ params }: { params: Params }) {
	const session = await auth();
	const { restaurantId } = await params;

	// Fetch public restaurant data with limited fields
	const restaurantData = await getRestaurantData(restaurantId);

	// Redirect home if restaurant does not exist
	if (!restaurantData) redirect("/");

	// Render the restaurant layout with session context (may be null)
	return (
		<div className="h-full">
			<RestaurantLayout restaurantData={restaurantData} session={session ?? null} />
		</div>
	);
}

/**
 * Function: getRestaurantData
 * Input:
 * - restaurantId: string — MongoDB ObjectId string representing the restaurant document to fetch
 * Output:
 * - Promise resolving to ReturnedRestaurant object if found, otherwise null
 *
 * Description:
 * Connects to the SwiftPOS MongoDB, queries the restaurants collection,
 * and returns a sanitized subset of fields suitable for public display.
 * Uses projection to limit the data fetched.
 * Converts the _id ObjectId to string before returning.
 * Catches and logs any DB errors, returning null on failure.
 */
const getRestaurantData = async (restaurantId: string): Promise<ReturnedRestaurant | null> => {
	const db = client.db("SwiftPOS");
	const collection = db.collection("restaurants");

	try {
		// Query restaurant with projection to include only public fields
		const restaurant = await collection.findOne(
			{ _id: new ObjectId(restaurantId) },
			{
				projection: {
					_id: 1,
					name: 1,
					description: 1,
					ownerId: 1,
					categories: 1,
					items: 1,
					dietaries: 1,
				},
			}
		);

		if (!restaurant) return null;

		// Return restaurant data with _id converted to string for client use
		return {
			_id: restaurant._id.toString(),
			name: restaurant.name,
			description: restaurant.description,
			ownerId: restaurant.ownerId,
			categories: restaurant.categories,
			items: restaurant.items,
			dietaries: restaurant.dietaries,
		};
	} catch (error) {
		console.error("Failed to fetch restaurant data:", error);
		return null;
	}
};

/**
 * Testing Notes:
 * - Verify redirect occurs when invalid or missing restaurantId is provided.
 * - Confirm restaurant data renders correctly with all expected fields.
 * - Test rendering with and without an authenticated session.
 * - Simulate DB errors and confirm error logging without crashing.
 */
