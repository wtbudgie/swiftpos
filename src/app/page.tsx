import React from "react";
import { auth } from "@/auth";

import RestaurantCard from "@/components/homePage/restaurantCard";

import FooterSection from "@/components/homePage/footerSection";
import HeaderSection from "@/components/homePage/headerSection";

import client from "@/lib/db";

interface returnedRestaurant {
	_id: string;
	name: string;
	description: string;
	address: string;
	imageUrl: string;
	ownerId: string;
}

export default async function MainPage() {
	const session = await auth();
	const restuarantList = await getRestaurantList();
	let registerOpen = false;
	if (!session?.user?.onboarded) registerOpen = false;

	return (
		<>
			{/* Main Layout */}
			<div className="min-h-screen bg-white flex flex-col relative">
				{/* Scrollable content area */}
				<div className="flex-1 overflow-y-auto px-6 py-10 pb-40">
					<div className="max-w-5xl mx-auto text-center">
						<HeaderSection user={session?.user!} registerOpen={registerOpen} />

						<p className="text-lg text-gray mb-10 font-semibold">Please select a restaurant you would like to order pickup from.</p>

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

const getRestaurantList = async (): Promise<returnedRestaurant[]> => {
	const db = client.db("SwiftPOS");
	const collection = db.collection("restaurants");

	try {
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

		const parsedRestaurants: returnedRestaurant[] = restaurants.map((r) => ({
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
		return [];
	}
};
