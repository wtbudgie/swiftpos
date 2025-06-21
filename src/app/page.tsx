/**
 * File: MainPage.tsx
 * Description: Server-side React component rendering the main landing page of SwiftPOS.
 *              Fetches user session and restaurant data from the database,
 *              then displays a list of restaurants as interactive cards.
 * Author: William Anderson
 */

import React from "react";
import { auth } from "@/utils/auth";
import RestaurantCard from "@/components/cards/RestaurantCard";
import FooterSection from "@/layouts/homePage/sections/FooterSection";
import HeaderSection from "@/layouts/homePage/sections/HeaderSection";
import client from "@/utils/db";

/**
 * Interface: ReturnedRestaurant
 * Represents the essential fields of a restaurant document returned from MongoDB.
 *
 * Properties:
 * - _id: string — Unique identifier of the restaurant.
 * - name: string — Restaurant name.
 * - description: string — Brief description of the restaurant.
 * - address: string — Physical address.
 * - imageUrl: string — URL for the restaurant's image.
 * - ownerId: string — Owner's unique identifier.
 */
interface ReturnedRestaurant {
	_id: string;
	name: string;
	description: string;
	address: string;
	imageUrl: string;
	ownerId: string;
}

/**
 * Function: MainPage
 * Asynchronous React server component that:
 * - Retrieves the current user session via auth().
 * - Fetches the list of restaurants from the database.
 * - Renders the landing page with header, restaurant cards, and footer.
 *
 * Input: none
 * Output: JSX.Element — the complete page structure.
 *
 * Notes:
 * - User registration availability is set false if the user is not onboarded.
 * - Restaurants with missing descriptions or images have placeholders.
 */
export default async function MainPage() {
	// Get current authenticated session (nullable)
	const session = await auth();

	// Fetch all restaurants from DB
	const restuarantList = await getRestaurantList();

	// Flag controlling registration UI based on user onboarding status
	let registerOpen = false;
	if (!session?.user?.onboarded) registerOpen = false;

	return (
		<>
			{/* Page container with white background and vertical flex layout */}
			<div className="min-h-screen bg-white flex flex-col relative">
				{/* Scrollable content area with padding */}
				<div className="flex-1 overflow-y-auto px-6 py-10 pb-40">
					<div className="max-w-5xl mx-auto text-center">
						{/* Page header showing user info and registration prompt */}
						<HeaderSection user={session?.user ?? null} registerOpen={registerOpen} />

						{/* Instructional text prompting restaurant selection */}
						<p className="text-lg text-gray mb-10 font-semibold">Please select a restaurant you would like to order pickup from.</p>

						{/* Responsive grid of restaurant cards */}
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
							{restuarantList.map((r) => (
								<RestaurantCard
									key={r._id}
									name={r.name}
									description={r.description || "No description"}
									address={r.address || "Address not available"}
									imageUrl={r.imageUrl || "/images/sample-restaurant.jpg"}
									id={r._id}
								/>
							))}
						</div>
					</div>
				</div>

				{/* Fixed footer section with contact info */}
				<FooterSection />
			</div>
		</>
	);
}

/**
 * Function: getRestaurantList
 * Fetches a list of restaurants from the MongoDB SwiftPOS database.
 *
 * Inputs: none
 * Outputs:
 * - Promise<ReturnedRestaurant[]> — resolves to an array of restaurants
 * - Returns empty array on failure to avoid UI errors.
 *
 * Behavior:
 * - Queries the "restaurants" collection with a projection for performance.
 * - Converts MongoDB ObjectIds to strings for client consumption.
 * - Handles errors by logging and returning an empty array.
 */
const getRestaurantList = async (): Promise<ReturnedRestaurant[]> => {
	const db = client.db("SwiftPOS");
	const collection = db.collection("restaurants");

	try {
		// Query with projection to return only needed fields
		const restaurants = await collection
			.find(
				{},
				{
					projection: {
						_id: 1,
						name: 1,
						description: 1,
						address: 1,
						imageUrl: 1,
						ownerId: 1,
					},
				}
			)
			.toArray();

		// Map Mongo documents to ReturnedRestaurant interface, converting ObjectIds to strings
		const parsedRestaurants: ReturnedRestaurant[] = restaurants.map((r) => ({
			_id: r._id.toString(),
			name: r.name,
			description: r.description,
			address: r.address,
			imageUrl: r.imageUrl,
			ownerId: r.ownerId.toString(),
		}));

		return parsedRestaurants;
	} catch (error) {
		console.error("Failed to fetch restaurants:", error);
		// Return empty array on error to prevent UI crash
		return [];
	}
};

/**
 * Testing Notes:
 * - Verify session is correctly fetched and passed to HeaderSection.
 * - Confirm restaurant list renders correctly with valid and placeholder data.
 * - Test grid responsiveness and scrolling behavior on multiple screen sizes.
 * - Simulate DB failure and check that empty restaurant list does not break UI.
 */
