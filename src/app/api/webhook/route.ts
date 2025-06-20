/**
 * File: stripeWebhookHandler.ts
 * Description: Handles Stripe webhook POST requests for completed checkout sessions.
 *              Processes payment confirmation, updates orders in the database,
 *              and broadcasts updated order data via WebSocket to the relevant restaurant.
 * Author: William Anderson
 * Created: 2025-06-19
 */

import Stripe from "stripe";
import { NextRequest } from "next/server";
import { headers } from "next/headers";
import client from "@/utils/db";
import { ObjectId } from "mongodb";
import { broadcastToRestaurant } from "@/utils/wsStore";
import { v4 } from "uuid";
import { Restaurant } from "@/types/RestaurantType";
import { ActiveOrder, OrderStatus, UserOrderReceipt } from "@/types/OrderType";
import { User } from "@/types/UserType";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Metadata structure expected in Stripe session metadata
type METADATA = {
	userId: string; // User's MongoDB ObjectId as string
	restaurantId: string; // Restaurant's MongoDB ObjectId as string
	pendingOrderId: string; // Pending order's MongoDB ObjectId as string
	// Additional fields can be added here if needed
};

/**
 * Function: POST
 * Input:
 *  - request: NextRequest — Incoming HTTP POST request from Stripe webhook
 * Output:
 *  - Response — HTTP response indicating success or failure of webhook processing
 * Description:
 *  Handles Stripe webhook events specifically for checkout.session.completed and
 *  checkout.session.async_payment_succeeded events. Validates the event signature,
 *  extracts and verifies metadata, updates the restaurant's active orders and user
 *  past orders in the database, removes the pending order, and broadcasts the updated
 *  orders via WebSocket to connected clients.
 */
export async function POST(request: NextRequest) {
	// Extract raw request body and Stripe signature header for event validation
	const body = await request.text();
	const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
	const headerList = await headers();
	const sig = headerList.get("stripe-signature")!;
	let event: Stripe.Event;

	try {
		// Verify the event came from Stripe and has a valid signature
		event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
	} catch (err) {
		// Invalid signature or malformed event
		return console.error(`Webhook Error: ${err}`, { status: 400 });
	}

	const eventType = event.type;

	// Only process checkout.session.completed and async payment succeeded events
	if (eventType !== "checkout.session.completed" && eventType !== "checkout.session.async_payment_succeeded") {
		console.log("event not handled", eventType);
		console.error("Event type not handled", { status: 200 }); // ignore other events
		return new Response(JSON.stringify({ message: "Event type not handled." }), { status: 200 });
	}

	// Extract the session object and metadata from the Stripe event
	const session = event.data.object as Stripe.Checkout.Session;
	const metadata = session.metadata as METADATA;
	console.log("Pending Order ID:", metadata.pendingOrderId);

	// Check for required metadata fields
	if (!metadata?.userId || !metadata?.restaurantId || !metadata?.pendingOrderId) {
		console.log(metadata);
		console.error("Missing metadata", { status: 400 });
		return new Response(JSON.stringify({ message: "Missing metadata." }), { status: 400 });
	}

	try {
		const db = client.db("SwiftPOS");
		const restaurantCollection = db.collection<Restaurant>("restaurants");
		const userCollection = db.collection<User>("users");

		// Find user in database by ObjectId
		const user = await userCollection.findOne({ _id: new ObjectId(metadata.userId) });
		if (!user) {
			console.error("User not found", { status: 404 });
			return new Response(JSON.stringify({ message: "User not found." }), { status: 404 });
		}

		// Find restaurant by ObjectId
		const restaurant = await restaurantCollection.findOne({ _id: new ObjectId(metadata.restaurantId) });
		if (!restaurant) {
			console.error("Restaurant not found", { status: 404 });
			return new Response(JSON.stringify({ message: "Restaurant not found." }), { status: 404 });
		}

		// Locate pending order by ObjectId in pendingOrders collection
		const pendingOrdersCollection = db.collection<ActiveOrder>("pendingOrders");
		const pendingOrderDb = await pendingOrdersCollection.findOne({ _id: new ObjectId(metadata.pendingOrderId) });

		if (!pendingOrderDb) {
			console.error("Pending order not found", { status: 404 });
			return new Response(JSON.stringify({ message: "Pending order not found." }), { status: 404 });
		}

		// Create new ActiveOrder object by copying pending order data and attaching payment intent ID
		const { _id, ...pendingOrderData } = pendingOrderDb;
		const newOrder: ActiveOrder = {
			...pendingOrderData,
			paymentIntentId: session.payment_intent?.toString() ?? "",
		};

		// Add new order to restaurant's activeOrders array
		await restaurantCollection.updateOne({ _id: new ObjectId(metadata.restaurantId) }, { $push: { activeOrders: newOrder } });

		// Remove pending order by session ID
		await pendingOrdersCollection.deleteOne({ sessionId: session.id });

		// Prepare past order record to append to user's pastOrders
		const pastOrder: UserOrderReceipt = {
			id: newOrder.id,
			orderPlacedAt: new Date().toISOString(),
			restaurantId: restaurant._id.toString(),
			restaurantName: restaurant.name,
			actualPrice: newOrder.actualPrice,
			discountAmount: newOrder.discountAmount,
			discountPrice: newOrder.discountAmount,
			items: newOrder.items.map((item) => ({
				name: item.name,
				quantity: item.quantity,
				totalPrice: item.totalPrice,
			})),
			status: OrderStatus.Pending,
		};

		// Update user's pastOrders array with the completed order receipt
		await userCollection.updateOne({ _id: new ObjectId(metadata.userId) }, { $push: { pastOrders: pastOrder } });

		// Retrieve updated restaurant document to get fresh activeOrders list
		const updatedRestaurant = await restaurantCollection.findOne({ _id: new ObjectId(metadata.restaurantId) });

		// Broadcast updated active orders to all connected clients via WebSocket
		broadcastToRestaurant(metadata.restaurantId, {
			restaurantId: metadata.restaurantId,
			orders: updatedRestaurant?.activeOrders || [],
		});

		console.error("Order created", { status: 200 });
		return new Response(JSON.stringify({ message: "Order created." }), { status: 200 });
	} catch (error) {
		// Handle any unexpected errors during processing
		console.error("Error handling webhook:", error);
		return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
	}
}

/**
 * Testing Notes:
 * - Use Stripe CLI or mock requests to simulate checkout.session.completed webhook calls.
 * - Verify the database is updated: activeOrders in restaurant, pastOrders in user.
 * - Confirm pending order is deleted from pendingOrders collection.
 * - Check that WebSocket broadcast is triggered with correct order data.
 *
 * Future Enhancements:
 * - Add authentication/authorization checks for webhook requests.
 * - Validate cart items more thoroughly before confirming orders.
 * - Implement retry or dead-letter queue for failed WebSocket broadcasts.
 * - Add logging improvements for better operational monitoring.
 */
