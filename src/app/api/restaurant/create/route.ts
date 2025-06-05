import { NextRequest } from "next/server";

import client from "@/utils/db";
import { auth } from "@/utils/auth";

import { Restaurant } from "@/types/RestaurantType";

export async function GET(req: NextRequest) {
	const session = await auth();

	if (!session || !session.user?.email) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
		});
	}

	const adminEmails = ["maniakwill@gmail.com"];
	if (!adminEmails.includes(session.user.email)) {
		return new Response(JSON.stringify({ message: "Forbidden" }), {
			status: 403,
		});
	}

	const url = new URL(req.url);
	const ownerId = url.searchParams.get("ownerId");

	if (!ownerId || typeof ownerId !== "string" || ownerId.trim() === "") {
		return new Response(JSON.stringify({ message: "Missing or invalid ownerId query parameter" }), { status: 400 });
	}

	const db = client.db("SwiftPOS");
	const collection = db.collection("restaurants");

	const defaultImage = "https://www.svgrepo.com/show/508699/landscape-placeholder.svg";
	const defaultItemId = `itm-${Date.now()}`;
	const defaultCategoryId = `cat-${Date.now()}`;

	const newRestaurant: Restaurant = {
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
				ingredients: [{ id: `ing-${Date.now()}`, name: "Ingredient 1", quantity: "100g" }],
				stockAmount: "infinite",
				modifications: [
					{
						id: `mod-${Date.now()}`,
						name: "Extras",
						options: [{ id: `opt-${Date.now()}`, name: "Cheese", priceModifier: 1.5 }],
						maxSelectable: 2,
						required: false,
					},
				],
				dietaries: ["G/F"],
				imageUrl: defaultImage,
				isActive: true,
			},
		],
		dietaries: ["G/F"],
		address: "123 Default St, City, State, ZIP",
		contactEmail: "contact@defaultrestaurant.com",
		phoneNumber: "123-456-7890",
		imageUrl: defaultImage,
	};

	const insertResult = await collection.insertOne(newRestaurant);

	if (!insertResult.acknowledged) {
		return new Response(JSON.stringify({ message: "Failed to create restaurant" }), { status: 500 });
	}

	const createdRestaurantId = insertResult.insertedId.toString();

	return new Response(
		JSON.stringify({
			restaurantId: createdRestaurantId,
			ownerId,
			ownerEmail: session.user.email,
			restaurantAccess: `/restaurant/${createdRestaurantId}/admin`,
		}),
		{ status: 201, headers: { "Content-Type": "application/json" } }
	);
}
