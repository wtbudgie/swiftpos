/**
 * File: createOrder.ts
 * Description: API route to create a new order for a restaurant, validate cart items, store a pending order in DB,
 *              and initiate a Stripe payment session for checkout.
 * Author: William Anderson
 */

import { auth } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import client from "@/utils/db";
import { ObjectId } from "mongodb";
import { v4 } from "uuid";
import { ActiveOrder, OrderedItem, OrderStatus } from "@/types/OrderType";
import { Item, Restaurant } from "@/types/RestaurantType";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2025-05-28.basil",
});

/**
 * Function: POST
 * Input:
 *  - req: NextRequest — Incoming HTTP request containing cart data (JSON)
 *  - params: Promise resolving to object with restaurantId (string)
 *
 * Output:
 *  - NextResponse JSON containing Stripe session ID, client secret, and pending order ID on success
 *  - Error JSON with appropriate HTTP status codes on failure
 *
 * Description:
 *  1. Authenticates user making the request.
 *  2. Validates 'cart' payload ensuring it is an array and that each item exists in the restaurant menu with matching prices.
 *  3. Retrieves restaurant data from MongoDB.
 *  4. Creates a new pending order record in DB with a unique ID, user info, timestamps, order status, and pricing.
 *  5. Initiates a Stripe checkout session with line items matching the cart, customer email, tax, payment settings, and metadata linking to the order and user.
 *  6. Returns Stripe session info for frontend to complete payment.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ restaurantId: string }> }) {
	const { restaurantId } = await params;
	const user = await auth();

	if (!user?.user?.id) {
		// Unauthorized if no user ID
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body: { cart: OrderedItem[] } = await req.json();
	const { cart } = body;
	console.log(cart);

	if (!Array.isArray(cart)) {
		// Cart must be an array
		return NextResponse.json({ error: "Cart must be an array" }, { status: 400 });
	}

	// Connect to DB and get restaurant info
	const db = client.db("SwiftPOS");
	const restaurantCollection = db.collection<Restaurant>("restaurants");
	const pendingOrderCollection = db.collection<ActiveOrder>("pendingOrders");
	const restaurant = await restaurantCollection.findOne({ _id: new ObjectId(restaurantId) });

	if (!restaurant) {
		// Restaurant ID not found
		return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
	}

	const restaurantItems = restaurant.items || [];

	// Validate each cart item against restaurant menu
	for (const item of cart) {
		const restItem = restaurantItems.find((i: Item) => i.id === item.itemId);
		if (!restItem) {
			// Item not found in restaurant menu
			return NextResponse.json({ error: `Item not found: ${item.itemId}` }, { status: 400 });
		}

		if (restItem.price !== item.basePrice) {
			// Price mismatch possible tampering
			return NextResponse.json({ error: `Price mismatch for item: ${item.itemId}` }, { status: 400 });
		}

		// Validate modifications if they exist
		if (item.modifications && item.modifications.length > 0) {
			// Check if the item has modifications in the restaurant menu
			if (!restItem.modifications || restItem.modifications.length === 0) {
				return NextResponse.json({ error: `Item does not allow modifications: ${item.itemId}` }, { status: 400 });
			}

			// Validate each modification
			for (const cartMod of item.modifications) {
				let modFound = false;
				let priceMatch = false;

				// Check all modification groups in the restaurant item
				for (const restModGroup of restItem.modifications) {
					const matchingOption = restModGroup.options.find((opt) => opt.id === cartMod.id);
					if (matchingOption) {
						modFound = true;
						if (matchingOption.priceModifier === cartMod.priceModifier) {
							priceMatch = true;
						}
						break;
					}
				}

				if (!modFound) {
					return NextResponse.json({ error: `Modification not found: ${cartMod.id} for item: ${item.itemId}` }, { status: 400 });
				}

				if (!priceMatch) {
					return NextResponse.json({ error: `Price mismatch for modification: ${cartMod.id} on item: ${item.itemId}` }, { status: 400 });
				}
			}

			// Validate max selectable modifications if needed
			// (This would depend on your business logic)
		}
	}

	try {
		// Calculate pricing totals; discount currently zero placeholder
		const discountAmount = 0;
		const actualPrice = cart.reduce((sum, item) => {
			const modTotal = item.modifications?.reduce((modSum, mod) => modSum + mod.priceModifier, 0) || 0;
			const itemTotal = (item.basePrice + modTotal) * item.quantity;
			return sum + itemTotal;
		}, 0);

		const discountPrice = actualPrice - discountAmount;

		// Build pending order object conforming to ActiveOrder type
		const newOrder: ActiveOrder = {
			id: v4(), // unique order ID (UUID v4)
			customerId: user.user.id,
			orderPlacedAt: new Date().toISOString(),
			status: OrderStatus.Pending,
			items: cart,
			discountAmount,
			discountPrice,
			actualPrice,
			notes: "",
			paymentIntentId: "",
		};

		// Insert pending order into DB
		const insertResult = await pendingOrderCollection.insertOne(newOrder);
		if (!insertResult.acknowledged) {
			return new Response(JSON.stringify({ message: "Failed to create temporary order" }), { status: 500 });
		}
		const pendingOrderId = insertResult.insertedId.toString();

		// Create Stripe checkout session for payment
		const session = await stripe.checkout.sessions.create({
			ui_mode: "embedded",
			line_items: cart.map((item) => {
				const productData: { name: string; description?: string } = {
					name: item.name,
				};

				if (item.customText?.trim()) {
					productData.description = item.customText.trim();
				}

				const modTotal = item.modifications?.reduce((modSum, mod) => modSum + mod.priceModifier, 0) || 0;
				const unitAmount = Math.round((item.basePrice + modTotal) * 100); // Stripe expects amount in cents

				return {
					price_data: {
						currency: "aud",
						product_data: productData,
						unit_amount: unitAmount,
					},
					quantity: item.quantity,
				};
			}),
			customer_email: user.user.email,
			custom_text: {
				terms_of_service_acceptance: {
					message: "You agree to SwiftPOS's Terms of Service. Additional instructions are subject to the kitchen’s capabilities.",
				},
				after_submit: { message: "Pay now to lock in your order - we'll send it to the restaurant the moment payment succeeds." },
			},
			consent_collection: { terms_of_service: "required", payment_method_reuse_agreement: { position: "auto" } },
			payment_method_types: ["card"],
			mode: "payment",
			automatic_tax: { enabled: true },
			return_url: `${req.headers.get("origin")}/?session_id={CHECKOUT_SESSION_ID}`,
			metadata: {
				userId: user.user.id,
				pendingOrderId,
				restaurantId,
			},
		});

		return NextResponse.json({
			id: session.id,
			client_secret: session.client_secret,
			pendingOrderId,
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
	}
}

/**
 * Testing Notes:
 * - Test with authenticated and unauthenticated users.
 * - Validate cart with valid and invalid items/prices.
 * - Confirm pending order is created in DB.
 * - Verify Stripe checkout session is created with correct line items and metadata.
 * - Simulate payment completion and order status update.
 */
