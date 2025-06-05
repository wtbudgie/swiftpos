import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Category, Item } from "@/types/RestaurantType";
import client from "@/lib/db";
import { ObjectId } from "mongodb";
import PageSection from "@/components/restaurantPage/page";

export interface returnedRestaurant {
	_id: string;
	name: string;
	description: string;
	ownerId: string;
	categories: Category[];
	items: Item[];
	dietaries: string[];
}

export default async function RestaurantPage({ params }: { params: { restaurantId: string } }) {
	const session = await auth();
	const { restaurantId } = await params;
	const restaurantData = await getRestaurantData(restaurantId);
	if (!restaurantData) redirect("/");

	return (
		<>
			<PageSection restaurantData={restaurantData} session={session!} />
		</>
	);
}

const getRestaurantData = async (restaurantId: string): Promise<returnedRestaurant | null> => {
	const db = client.db("SwiftPOS");
	const collection = db.collection("restaurants");

	try {
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

		const parsedRestaurant: returnedRestaurant = {
			_id: restaurant._id.toString(),
			name: restaurant.name,
			description: restaurant.description,
			ownerId: restaurant.ownerId,
			categories: restaurant.categories,
			items: restaurant.items,
			dietaries: restaurant.dietaries,
		};

		return parsedRestaurant;
	} catch (error) {
		console.error("Failed to fetch restaurants:", error);
		return null;
	}
};
