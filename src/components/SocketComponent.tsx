import { useCallback, useRef, useEffect, useState } from "react";
import { ActiveOrder } from "@/types/OrderType";

export interface Order {
	restaurantId: string;
	orders: ActiveOrder[];
}

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

export function useActiveOrders(url: () => string) {
	const socket = useWebSocket(url);
	const [orders, setOrders] = useState<Order[]>([]);

	useEffect(() => {
		const controller = new AbortController();

		socket?.addEventListener(
			"message",
			async (event) => {
				const payload = typeof event.data === "string" ? event.data : await event.data.text();
				const message = JSON.parse(payload) as Order;
				console.log("Incoming message:");

				setOrders((prevOrders) => {
					const index = prevOrders.findIndex((o) => o.restaurantId === message.restaurantId);
					const deduped = [...new Map(message.orders.map((o) => [o.id, o])).values()];

					if (index !== -1) {
						const updated = [...prevOrders];
						updated[index] = {
							restaurantId: message.restaurantId,
							orders: deduped,
						};
						return updated;
					} else {
						return [...prevOrders, { restaurantId: message.restaurantId, orders: deduped }];
					}
				});
			},
			controller
		);

		socket?.addEventListener(
			"error",
			() => {
				console.error("WebSocket error occurred");
			},
			controller
		);

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

	const setOrder = useCallback(
		(orderOrUpdater: Order | ((prevOrders: Order[]) => Order)) => {
			const order = typeof orderOrUpdater === "function" ? orderOrUpdater(orders) : orderOrUpdater;

			if (!socket || socket.readyState !== socket.OPEN) return;
			socket.send(JSON.stringify(order));

			setOrders((prevOrders) => {
				const index = prevOrders.findIndex((o) => o.restaurantId === order.restaurantId);
				const deduped = [...new Map(order.orders.map((o) => [o.id, o])).values()];

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
