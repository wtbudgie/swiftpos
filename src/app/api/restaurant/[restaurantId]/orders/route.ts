/**
 * File: socketHandler.ts
 * Description: WebSocket handler for managing real-time order updates in SwiftPOS.
 * Author: William Anderson
 */

import { Restaurant } from "@/types/RestaurantType";
import dbClient from "@/utils/db";
import { ObjectId } from "mongodb";
import { addClient, removeClient, getClients } from "@/utils/wsStore";
import { ActiveOrder } from "@/types/OrderType";
import { User } from "@/types/UserType";
import { sendEmail } from "@/utils/sendEmail";

// Type: Promise resolving to WebSocket connection parameters
type Params = Promise<{ restaurantId: string }>;

/**
 * Function: SOCKET
 * Input:
 *  - client: WebSocket — the client's WebSocket connection
 *  - _request: IncomingMessage — HTTP request metadata (unused)
 *  - _server: WebSocketServer — WebSocket server instance (unused)
 *  - params: Params — resolves to object containing restaurantId (string)
 *
 * Output:
 *  - void (sets up event listeners for the socket connection)
 *
 * Description:
 *  Manages real-time order updates and broadcasting for a restaurant.
 *  Handles client subscription, data synchronization, and email notifications.
 */
export async function SOCKET(
	client: import("ws").WebSocket,
	_request: import("node:http").IncomingMessage,
	_server: import("ws").WebSocketServer,
	{ params }: { params: Params }
) {
	const { restaurantId } = await params;

	addClient(restaurantId, client);

	const db = dbClient.db("SwiftPOS");
	const restaurant = await db.collection<Restaurant>("restaurants").findOne({ _id: new ObjectId(restaurantId) });

	// Send initial order data to newly connected client
	client.send(
		JSON.stringify({
			restaurantId,
			orders: restaurant?.activeOrders || [],
		})
	);

	// Remove client from tracking store when disconnected
	client.on("close", () => {
		removeClient(restaurantId, client);
	});

	// Message payload type from client
	type RecievingMessage = {
		orders: ActiveOrder[];
		restaurantId: string;
	};

	/**
	 * WebSocket message listener:
	 * - Updates active orders in DB
	 * - Sends email notifications to customers
	 * - Broadcasts updates to all clients
	 */
	client.on("message", async (data) => {
		try {
			const message = JSON.parse(data.toString()) as RecievingMessage;
			const { restaurantId, orders: updatedOrders } = message;

			const db = dbClient.db("SwiftPOS");
			const restaurantCollection = db.collection<Restaurant>("restaurants");
			const userCollection = db.collection<User>("users");

			const restaurant = await restaurantCollection.findOne({ _id: new ObjectId(restaurantId) });
			if (!restaurant) {
				console.error(`Restaurant ${restaurantId} not found`);
				return;
			}

			const currentOrders = restaurant.activeOrders || [];

			// Identify only changed orders to avoid redundant writes/emails
			const changedOrders = updatedOrders.filter((updatedOrder) => {
				const existingOrder = currentOrders.find((o) => o.id === updatedOrder.id);
				return !existingOrder || JSON.stringify(existingOrder) !== JSON.stringify(updatedOrder);
			});

			// Process each changed order
			for (const order of changedOrders) {
				if (!order.customerId) continue;

				const customerId = new ObjectId(order.customerId);

				// Update the order status in the user's record
				const result = await userCollection.updateOne(
					{
						_id: customerId,
						"pastOrders.id": order.id,
					},
					{
						$set: { "pastOrders.$.status": order.status },
					}
				);

				if (result.matchedCount === 0) {
					console.warn(`⚠️ No match found for user ${order.customerId} with order ID ${order.id}`);
					continue;
				}

				const updatedUser = await userCollection.findOne({ _id: customerId });

				if (!updatedUser?.email) {
					console.warn(`⚠️ No email found for user ${order.customerId}`);
					continue;
				}

				// Build order update email content
				const subject = `Your Order at ${restaurant.name} Has Been Updated`;

				const html = `
					<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
						<h2 style="color: #2c3e50;">SwiftPOS — Order Update</h2>
						<p>Hi ${updatedUser.firstName || "there"},</p>

						<p>Your order <strong>#${order.id}</strong> from <strong>${restaurant.name}</strong> has been updated to:</p>
						<p style="font-size: 1.2em; font-weight: bold; color: #27ae60;">${order.status.toUpperCase()}</p>

						<h3 style="margin-top: 30px;">🧾 Order Summary:</h3>
						<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
							<thead>
								<tr style="background-color: #f4f4f4;">
									<th style="text-align: left; padding: 8px;">Item</th>
									<th style="text-align: right; padding: 8px;">Quantity</th>
									<th style="text-align: right; padding: 8px;">Total</th>
								</tr>
							</thead>
							<tbody>
								${order.items
									.map(
										(item) => `
									<tr>
										<td style="padding: 8px;">${item.name}</td>
										<td style="text-align: right; padding: 8px;">${item.quantity}</td>
										<td style="text-align: right; padding: 8px;">$${item.totalPrice.toFixed(2)}</td>
									</tr>
								`
									)
									.join("")}
							</tbody>
						</table>

						<hr style="margin: 30px 0;">

						<table style="width: 100%; font-size: 1em;">
							<tr>
								<td><strong>Subtotal:</strong></td>
								<td style="text-align: right;">$${(order.actualPrice + order.discountAmount).toFixed(2)}</td>
							</tr>
							<tr>
								<td><strong>Discount:</strong></td>
								<td style="text-align: right;">-$${order.discountAmount.toFixed(2)}</td>
							</tr>
							<tr>
								<td><strong>Total:</strong></td>
								<td style="text-align: right; font-weight: bold;">$${order.actualPrice.toFixed(2)}</td>
							</tr>
						</table>

						<p style="margin-top: 30px;">We’ll keep you updated as your order progresses.</p>
						<p>Thanks for choosing <strong>${restaurant.name}</strong> and SwiftPOS.</p>

						<p style="font-size: 0.9em; color: #999;">Order placed at ${new Date(order.orderPlacedAt).toLocaleString()}</p>
					</div>
				`;

				// Send the email
				try {
					await sendEmail(updatedUser.email, subject, html);
					console.log(`📧 Email sent to ${updatedUser.email} for order ${order.id}`);
				} catch (err) {
					console.error(`❌ Failed to send email to ${updatedUser.email}:`, err);
				}
			}

			// Merge updated orders with unchanged ones for DB storage
			const mergedOrders = [
				...new Map([...currentOrders.filter((o) => !updatedOrders.some((u) => u.id === o.id)), ...updatedOrders].map((o) => [o.id, o])).values(),
			];

			await restaurantCollection.updateOne({ _id: new ObjectId(restaurantId) }, { $set: { activeOrders: mergedOrders } });

			// Broadcast updated order list to all connected clients
			const broadcastMessage = JSON.stringify({ restaurantId, orders: mergedOrders });
			for (const client of getClients(restaurantId)) {
				if (client.readyState === client.OPEN) {
					client.send(broadcastMessage);
				}
			}
		} catch (error) {
			console.error("Failed to process incoming message", error);
		}
	});
}

/**
 * Testing Notes:
 * - Simulate client connection via WebSocket and verify initial data receipt.
 * - Send mock order update payload and assert:
 *    a) database writes are correct
 *    b) email is sent
 *    c) broadcast updates are received by all clients
 * - Disconnect client and ensure it is removed from wsStore.
 */
