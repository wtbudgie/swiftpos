/**
 * File: RestaurantPage.tsx
 * Description: Server-side page to load restaurant data for admin access in SwiftPOS.
 *              Validates user session and ownership before rendering the admin layout with full restaurant details.
 * Author: William Anderson
 */

import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";

import client from "@/utils/db";
import { auth } from "@/utils/auth";

import { Restaurant } from "@/types/RestaurantType";

import AdminLayout from "@/layouts/adminPage/AdminLayout";

/**
 * Interface: ReturnedRestaurant
 * Represents minimal restaurant data used for authorization checks.
 * _id: string - Restaurant ID as string.
 * ownerId: string - Owner user ID.
 */
export interface ReturnedRestaurant {
	_id: string;
	ownerId: string;
}

/**
 * Type: SanitizedRestaurant
 * Represents full restaurant data sanitized for client use.
 * Converts MongoDB ObjectId to string for _id.
 */
export type SanitizedRestaurant = Omit<Restaurant, "_id"> & {
	_id: string;
};

/**
 * Type: Params
 * Represents the parameters passed to the page component.
 * Contains restaurantId as a string inside a Promise.
 */
type Params = Promise<{ restaurantId: string }>;

/**
 * Function: AdminPage (default export)
 * Input:
 * - params: { restaurantId: string } (wrapped in Promise)
 * Output:
 * - JSX Element rendering the AdminLayout or redirects unauthorized users
 *
 * Description:
 * Loads the current user's session and verifies ownership of the restaurant.
 * Fetches minimal restaurant data for authorization, redirects if not found or unauthorized.
 * If authorized, fetches full restaurant data and renders AdminLayout.
 */
export default async function AdminPage({ params }: { params: Params }) {
	const session = await auth();
	const { restaurantId } = await params;

	const restaurantData = await getRestaurantData(restaurantId);
	if (!restaurantData) {
		// Redirect to public restaurant page if restaurant does not exist
		redirect(`/restaurant/${restaurantId}`);
	}

	if (!session || session.user?.id !== restaurantData.ownerId) {
		// Redirect unauthorized users to public restaurant page
		redirect(`/restaurant/${restaurantId}`);
	}

	const fullRestaurantData = await getFullRestaurantData(restaurantId);
	if (!fullRestaurantData) {
		// Redirect to home if full restaurant data cannot be fetched
		redirect("/");
	}

	// Render admin interface with full restaurant details
	return <AdminLayout restaurantData={fullRestaurantData} session={session} />;
}

/**
 * Function: getRestaurantData
 * Input:
 * - restaurantId: string - Restaurant's unique ID
 * Output:
 * - Promise resolving to ReturnedRestaurant object or null if not found
 *
 * Description:
 * Retrieves minimal restaurant data (_id and ownerId) from the database,
 * used for verifying ownership during authorization.
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
 * Function: getFullRestaurantData
 * Input:
 * - restaurantId: string - Restaurant's unique ID
 * Output:
 * - Promise resolving to SanitizedRestaurant object or null if not found
 *
 * Description:
 * Retrieves the full restaurant document from the database,
 * sanitizes it by converting the ObjectId to string and returning relevant fields.
 */
const getFullRestaurantData = async (restaurantId: string): Promise<SanitizedRestaurant | null> => {
	const db = client.db("SwiftPOS");
	const collection = db.collection("restaurants");

	try {
		const restaurant = await collection.findOne({ _id: new ObjectId(restaurantId) });

		if (!restaurant) return null;

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
