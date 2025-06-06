/**
 * File: RestaurantPage.tsx
 * Description: Server-side page to load restaurant data for admin access.
 *              It performs session validation and owner authorization,
 *              then renders the admin layout with the full restaurant data.
 * Author: William Anderson
 */

import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";

import client from "@/utils/db";
import { auth } from "@/utils/auth";

import { Restaurant } from "@/types/RestaurantType";

import AdminLayout from "@/layouts/adminPage/AdminLayout";

// Type representing minimal restaurant data fetched for authorization checks
export interface ReturnedRestaurant {
	_id: string;
	ownerId: string;
}

// Restaurant type with _id as string (sanitized for client usage)
export type SanitizedRestaurant = Omit<Restaurant, "_id"> & {
	_id: string;
};

// Typing for params passed in props
type Params = Promise<{ restaurantId: string }>;

/**
 * Page component that loads restaurant data and renders admin interface.
 * Redirects users if not authorized or data not found.
 */
export default async function RestaurantPage({ params }: { params: Params }) {
	const session = await auth();
	const { restaurantId } = await params;

	// Fetch minimal restaurant data for authorization
	const restaurantData = await getRestaurantData(restaurantId);
	if (!restaurantData) {
		// Redirect to public restaurant page if restaurant not found
		redirect(`/restaurant/${restaurantId}`);
	}

	// Redirect if user is not authenticated or not the owner
	if (!session || session.user?.id !== restaurantData.ownerId) {
		redirect(`/restaurant/${restaurantId}`);
	}

	// Fetch full restaurant data for admin view
	const fullRestaurantData = await getFullRestaurantData(restaurantId);
	if (!fullRestaurantData) {
		// Redirect to home if full data is missing
		redirect("/");
	}

	// Render the admin layout with fetched data
	return (
		<>
			<AdminLayout restaurantData={fullRestaurantData} session={session} />
		</>
	);
}

/**
 * Fetches minimal restaurant data (_id and ownerId) from the database.
 *
 * @param {string} restaurantId - The restaurant's ID.
 * @returns {Promise<ReturnedRestaurant | null>} - The restaurant data or null if not found.
 */
const getRestaurantData = async (restaurantId: string): Promise<ReturnedRestaurant | null> => {
	const db = client.db("SwiftPOS");
	const collection = db.collection("restaurants");

	try {
		const restaurant = await collection.findOne({ _id: new ObjectId(restaurantId) }, { projection: { _id: 1, ownerId: 1 } });

		if (!restaurant) return null;

		return {
			_id: restaurant._id.toString(),
			ownerId: restaurant.ownerId,
		};
	} catch (error) {
		console.error("Failed to fetch minimal restaurant data:", error);
		return null;
	}
};

/**
 * Fetches full restaurant data from the database and sanitizes it.
 *
 * @param {string} restaurantId - The restaurant's ID.
 * @returns {Promise<SanitizedRestaurant | null>} - The full restaurant data or null if not found.
 */
const getFullRestaurantData = async (restaurantId: string): Promise<SanitizedRestaurant | null> => {
	const db = client.db("SwiftPOS");
	const collection = db.collection("restaurants");

	try {
		const restaurant = await collection.findOne({ _id: new ObjectId(restaurantId) });

		if (!restaurant) return null;

		// Explicitly construct the sanitized restaurant object
		return {
			_id: restaurant._id.toString(),
			name: restaurant.name,
			description: restaurant.description,
			ownerId: restaurant.ownerId,
			employeeIds: restaurant.employeeIds,
			categories: restaurant.categories,
			items: restaurant.items,
			dietaries: restaurant.dietaries,
			address: restaurant.address,
			contactEmail: restaurant.contactEmail,
			phoneNumber: restaurant.phoneNumber,
			imageUrl: restaurant.imageUrl,
			activeOrders: restaurant.activeOrders,
		};
	} catch (error) {
		console.error("Failed to fetch full restaurant data:", error);
		return null;
	}
};
