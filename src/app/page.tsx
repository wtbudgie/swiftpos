/**
 * File: MainPage.tsx
 * Description: Server-side React component that renders the main landing page with a list of restaurants.
 *              Fetches session and restaurant data from the database and displays restaurant cards.
 * Author: William Anderson
 */

import React from "react";
import { auth } from "@/utils/auth";

import RestaurantCard from "@/components/cards/RestaurantCard";

import FooterSection from "@/layouts/homePage/sections/FooterSection";
import HeaderSection from "@/layouts/homePage/sections/HeaderSection";

import client from "@/utils/db";

/**
 * Interface representing the essential data returned for each restaurant.
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
 * MainPage - Async server component
 * Fetches current user session and the list of restaurants from the database.
 * Passes data to child components for rendering the page.
 *
 * @returns {JSX.Element} The main page JSX.
 */
export default async function MainPage() {
	// Retrieve current user session
	const session = await auth();

	// Fetch restaurants from database
	const restuarantList = await getRestaurantList();

	// Determine if user registration is open (false if user not onboarded)
	let registerOpen = false;
	if (!session?.user?.onboarded) registerOpen = false;

	return (
		<>
			{/* Main container with white background and vertical flex layout */}
			<div className="min-h-screen bg-white flex flex-col relative">
				{/* Scrollable content area with padding */}
				<div className="flex-1 overflow-y-auto px-6 py-10 pb-40">
					<div className="max-w-5xl mx-auto text-center">
						{/* Header with user info and registration status */}
						<HeaderSection user={session?.user ?? null} registerOpen={registerOpen} />

						{/* Instructional paragraph */}
						<p className="text-lg text-gray mb-10 font-semibold">Please select a restaurant you would like to order pickup from.</p>

						{/* Grid layout for restaurant cards */}
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

				{/* Fixed footer contact section */}
				<FooterSection />
			</div>
		</>
	);
}

/**
 * Fetches the list of restaurants from MongoDB database.
 *
 * @returns {Promise<ReturnedRestaurant[]>} Promise resolving to an array of restaurants and returns empty array on error.
 */
const getRestaurantList = async (): Promise<ReturnedRestaurant[]> => {
	const db = client.db("SwiftPOS");
	const collection = db.collection("restaurants");

	try {
		// Query restaurants with only required fields for performance
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

		// Transform MongoDB documents to application-friendly format
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
		// Return empty list in case of failure
		return [];
	}
};
