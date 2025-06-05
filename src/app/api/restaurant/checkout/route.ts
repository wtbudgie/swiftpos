import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { v4 } from "uuid";

import client from "@/utils/db";
import { auth } from "@/utils/auth";

import { Item, ModificationGroup, ModificationOption, Restaurant } from "@/types/RestaurantType";
import { ActiveOrder, OrderStatus } from "@/types/OrderType";

export async function POST(req: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const { restaurantId, cart } = body;

		if (!restaurantId || typeof restaurantId !== "string") {
			return NextResponse.json({ error: "restaurantId is required and must be a string" }, { status: 400 });
		}

		if (!Array.isArray(cart)) {
			return NextResponse.json({ error: "cart must be an array of OrderedItem" }, { status: 400 });
		}

		for (const item of cart) {
			if (
				typeof item.itemId !== "string" ||
				typeof item.name !== "string" ||
				typeof item.quantity !== "number" ||
				typeof item.basePrice !== "number" ||
				typeof item.customText !== "string" ||
				typeof item.totalPrice !== "number"
			) {
				return NextResponse.json({ error: "Invalid cart item format" }, { status: 400 });
			}
		}

		const db = client.db("SwiftPOS");
		const restaurantCollection = db.collection<Restaurant>("restaurants");

		const restaurant = await restaurantCollection.findOne({ _id: new ObjectId(restaurantId) });

		if (!restaurant) {
			return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
		}

		const restaurantItems: Item[] = restaurant.items || [];

		function areValidMods(mods: ModificationOption[] = [], validModGroups: ModificationGroup[] = []) {
			for (const mod of mods) {
				let found = false;
				for (const group of validModGroups) {
					if (
						group.options.find((opt: ModificationOption) => opt.id === mod.id && opt.priceModifier === mod.priceModifier && opt.name === mod.name)
					) {
						found = true;
						break;
					}
				}
				if (!found) return false;
			}
			return true;
		}

		for (const item of cart) {
			const restItem = restaurantItems.find((i) => i.id === item.itemId);
			if (!restItem) {
				return NextResponse.json({ error: `Item not found in restaurant for itemId: ${item.itemId}` }, { status: 400 });
			}

			if (restItem.price !== item.basePrice) {
				return NextResponse.json({ error: `Base price mismatch for itemId: ${item.itemId}` }, { status: 400 });
			}

			if (item.modifications && item.modifications.length > 0) {
				if (!restItem.modifications || restItem.modifications.length === 0) {
					return NextResponse.json({ error: `Item ${item.itemId} does not support modifications` }, { status: 400 });
				}

				if (!areValidMods(item.modifications, restItem.modifications)) {
					return NextResponse.json({ error: `Invalid modifications for itemId: ${item.itemId}` }, { status: 400 });
				}
			}
		}

		const discountAmount = 0; // placeholder for discount logic
		const actualPrice = cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);
		const discountPrice = actualPrice - discountAmount;

		const newOrder: ActiveOrder = {
			id: v4(),
			customerId: session.user.id,
			orderPlacedAt: new Date().toISOString(),
			status: OrderStatus.Pending,
			items: cart,
			discountAmount,
			discountPrice,
			actualPrice,
			notes: "",
		};

		await restaurantCollection.updateOne({ _id: new ObjectId(restaurantId) }, { $push: { activeOrders: newOrder } });

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error) {
		console.error("Save cart failed:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
