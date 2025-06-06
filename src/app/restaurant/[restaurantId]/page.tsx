/**
 * File: RestaurantPage.tsx
 * Description: Server-side page to load public restaurant data and render the restaurant layout.
 *              Redirects to home if restaurant not found.
 * Author: William Anderson
 */

import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";

import client from "@/utils/db";
import { auth } from "@/utils/auth";

import { Category, Item } from "@/types/RestaurantType";
import RestaurantLayout from "@/layouts/restaurantPage/RestaurantLayout";

/**
 * Type for the restaurant data returned from DB with selected fields.
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
 * Params type representing the route params containing restaurantId.
 * Awaited since params may be a Promise.
 */
type Params = Promise<{ restaurantId: string }>;

/**
 * Page component for rendering the restaurant's public page.
 *
 * @param params - Route params including restaurantId.
 * @returns JSX.Element rendering RestaurantLayout or redirects if no data.
 */
export default async function RestaurantPage({ params }: { params: Params }) {
	const session = await auth();
	const { restaurantId } = await params;

	// Fetch limited restaurant data for public view
	const restaurantData = await getRestaurantData(restaurantId);

	// Redirect to homepage if restaurant not found
	if (!restaurantData) redirect("/");

	// Render restaurant layout, pass session for personalization if available
	return <RestaurantLayout restaurantData={restaurantData} session={session ?? null} />;
}

/**
 * Fetches a sanitized subset of restaurant data from MongoDB.
 *
 * @param restaurantId - The MongoDB ObjectId string of the restaurant.
 * @returns Promise resolving to restaurant data or null if not found/error.
 */
const getRestaurantData = async (restaurantId: string): Promise<ReturnedRestaurant | null> => {
	const db = client.db("SwiftPOS");
	const collection = db.collection("restaurants");

	try {
		// Query with projection to limit fetched fields
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

		// Return sanitized restaurant object with stringified _id
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
