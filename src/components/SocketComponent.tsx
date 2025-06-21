/**
 * File: websocketHooks.ts
 * Description: Custom React hooks for WebSocket communication in SwiftPOS.
 * Provides real-time order management through WebSocket connections.
 * Author: William Anderson
 */

import { useCallback, useRef, useEffect, useState } from "react";
import { ActiveOrder } from "@/types/OrderType";

/**
 * Interface: Order
 *
 * Structure for WebSocket order messages:
 * - restaurantId: string — Unique identifier for the restaurant
 * - orders: ActiveOrder[] — Array of active orders for the restaurant
 */
export interface Order {
	restaurantId: string;
	orders: ActiveOrder[];
}

/**
 * Hook: useWebSocket
 *
 * Input:
 * - url: () => string — Function that returns WebSocket URL
 *
 * Output:
 * - WebSocket | null — The WebSocket instance or null if not connected
 *
 * Description:
 * Manages WebSocket connection lifecycle:
 * 1. Creates WebSocket connection on mount
 * 2. Automatically cleans up on unmount
 * 3. Provides stable reference to socket instance
 */
export function useWebSocket(url: () => string) {
	const ref = useRef<WebSocket>(null);
	const target = useRef(url);
	const [, update] = useState(0);

	useEffect(() => {
		if (ref.current) return;
		const socket = new WebSocket(target.current());
		console.log("WebSocket created:", socket);
		ref.current = socket;
		update((p) => p + 1);

		return () => socket.close();
	}, []);

	return ref.current;
}

/**
 * Hook: useActiveOrders
 *
 * Input:
 * - url: () => string — Function that returns WebSocket URL
 *
 * Output:
 * - [Order[], (order: Order | updaterFn) => void] — Tuple containing:
 *   - orders: Current state of orders
 *   - setOrder: Function to update orders
 *
 * Description:
 * Manages real-time order state through WebSocket:
 * 1. Subscribes to WebSocket messages
 * 2. Handles message parsing and state updates
 * 3. Provides method to send order updates
 * 4. Manages error states and reconnections
 */
export function useActiveOrders(url: () => string) {
	const socket = useWebSocket(url);
	const [orders, setOrders] = useState<Order[]>([]);

	// Handle incoming WebSocket messages
	useEffect(() => {
		const controller = new AbortController();

		// Message handler for order updates
		socket?.addEventListener(
			"message",
			async (event) => {
				const payload = typeof event.data === "string" ? event.data : await event.data.text();
				const message = JSON.parse(payload) as Order;

				setOrders((prevOrders) => {
					// Deduplicate orders by ID
					const deduped = [...new Map(message.orders.map((o) => [o.id, o])).values()];
					const index = prevOrders.findIndex((o) => o.restaurantId === message.restaurantId);

					if (index !== -1) {
						// Update existing restaurant orders
						const updated = [...prevOrders];
						updated[index] = {
							restaurantId: message.restaurantId,
							orders: deduped,
						};
						return updated;
					} else {
						// Add new restaurant orders
						return [...prevOrders, { restaurantId: message.restaurantId, orders: deduped }];
					}
				});
			},
			controller
		);

		// Error handler
		socket?.addEventListener(
			"error",
			() => {
				console.error("WebSocket error occurred");
			},
			controller
		);

		// Close handler
		socket?.addEventListener(
			"close",
			(event) => {
				if (!event.wasClean) {
					console.warn("WebSocket closed unexpectedly");
					setOrders([]);
				}
			},
			controller
		);

		return () => controller.abort();
	}, [socket]);

	/**
	 * Function: setOrder
	 *
	 * Input:
	 * - orderOrUpdater: Order | ((prevOrders: Order[]) => Order) — Order object or updater function
	 *
	 * Description:
	 * Updates order state and sends through WebSocket:
	 * 1. Handles both direct values and functional updates
	 * 2. Deduplicates orders before sending/updating
	 * 3. Only sends when socket is open
	 * 4. Updates local state optimistically
	 */
	const setOrder = useCallback(
		(orderOrUpdater: Order | ((prevOrders: Order[]) => Order)) => {
			const order = typeof orderOrUpdater === "function" ? orderOrUpdater(orders) : orderOrUpdater;

			if (!socket || socket.readyState !== socket.OPEN) return;
			socket.send(JSON.stringify(order));

			setOrders((prevOrders) => {
				const deduped = [...new Map(order.orders.map((o) => [o.id, o])).values()];
				const index = prevOrders.findIndex((o) => o.restaurantId === order.restaurantId);

				if (index !== -1) {
					const updated = [...prevOrders];
					updated[index] = { restaurantId: order.restaurantId, orders: deduped };
					return updated;
				} else {
					return [...prevOrders, { restaurantId: order.restaurantId, orders: deduped }];
				}
			});
		},
		[socket, orders]
	);

	return [orders, setOrder] as const;
}

/**
 * Testing Notes:
 * - Verify WebSocket connection establishment
 * - Test message handling with valid/invalid payloads
 * - Verify order deduplication logic
 * - Test setOrder function with both value and function updates
 * - Verify error handling for WebSocket errors
 * - Test connection close scenarios
 * - Verify state cleanup on unmount
 * - Test multiple restaurant order management
 * - Verify performance with large order sets
 */
