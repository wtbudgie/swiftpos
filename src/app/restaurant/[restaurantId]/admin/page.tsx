import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";

import client from "@/utils/db";
import { auth } from "@/utils/auth";

import { Restaurant } from "@/types/RestaurantType";

import PageSection from "@/layouts/adminPage/AdminLayout";

export interface ReturnedRestaurant {
	_id: string;
	ownerId: string;
}

export type SanitizedRestaurant = Omit<Restaurant, "_id"> & {
	_id: string;
};

type Params = Promise<{ restaurantId: string }>;

export default async function RestaurantPage({ params }: { params: Params }) {
	const session = await auth();
	const { restaurantId } = await params;

	const ownerId = (await getRestaurantData(restaurantId))?.ownerId;

	if (!session) redirect(`/restaurant/${restaurantId}`);
	if (session?.user?.id !== ownerId) redirect(`/restaurant/${restaurantId}`);

	const fullRestaurantData = await getFullRestaurantData(restaurantId);
	if (!fullRestaurantData) redirect("/");

	return (
		<>
			<PageSection restaurantData={fullRestaurantData} session={session!} />
		</>
	);
}

const getRestaurantData = async (restaurantId: string): Promise<ReturnedRestaurant | null> => {
	const db = client.db("SwiftPOS");
	const collection = db.collection("restaurants");

	try {
		const restaurant = await collection.findOne(
			{ _id: new ObjectId(restaurantId) },
			{
				projection: {
					_id: 1,
					ownerId: 1,
				},
			}
		);

		if (!restaurant) return null;

		const parsedRestaurant: ReturnedRestaurant = {
			_id: restaurant._id.toString(),
			ownerId: restaurant.ownerId,
		};

		return parsedRestaurant;
	} catch (error) {
		console.error("Failed to fetch restaurants:", error);
		return null;
	}
};

const getFullRestaurantData = async (restaurantId: string): Promise<SanitizedRestaurant | null> => {
	const db = client.db("SwiftPOS");
	const collection = db.collection("restaurants");

	try {
		const restaurant = await collection.findOne({ _id: new ObjectId(restaurantId) });

		if (!restaurant) return null;

		const sanitizedRestaurant: SanitizedRestaurant = {
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

		return sanitizedRestaurant;
	} catch (error) {
		console.error("Failed to fetch restaurant:", error);
		return null;
	}
};
