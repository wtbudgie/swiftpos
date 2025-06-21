/**
 * File: ActiveOrdersListPage.tsx
 * Description: Displays and manages active orders for a restaurant in SwiftPOS.
 * Organizes orders by status (Pending, Preparing, Ready) and provides status update functionality.
 * Author: William Anderson
 */

"use client";

import { useEffect, useState } from "react";
import { ActiveOrder, OrderStatus } from "@/types/OrderType";
import { SanitizedRestaurant } from "@/app/restaurant/[restaurantId]/admin/page";
import { Order, useActiveOrders } from "@/components/SocketComponent";

/**
 * Type: ActiveOrdersListPageProps
 *
 * Component props:
 * - restaurantData: SanitizedRestaurant — Contains restaurant information including ID
 */
type ActiveOrdersListPageProps = {
	restaurantData: SanitizedRestaurant;
};

/**
 * Component: ActiveOrdersListPage
 *
 * Input:
 * - Props as defined in ActiveOrdersListPageProps
 *
 * Output:
 * - React component rendering order management interface
 *
 * Description:
 * Manages and displays restaurant orders with:
 * - Real-time WebSocket updates
 * - Order status tracking (Pending → Preparing → Ready → Completed)
 * - Expandable order details
 * - Responsive grid layout
 * - Dark mode support
 */
export default function ActiveOrdersListPage({ restaurantData }: ActiveOrdersListPageProps) {
	const restaurantId = restaurantData._id;

	// WebSocket connection for real-time order updates
	const [orders, setOrder] = useActiveOrders(() => `ws://${window.location.host}/api/restaurant/${restaurantId}/orders`);

	// UI state for expanded order details
	const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

	// Flatten all orders from different restaurants
	const allActiveOrders = orders.flatMap((o) => o.orders);

	// State for categorized orders
	const [pendingOrders, setPendingOrders] = useState<ActiveOrder[]>(allActiveOrders.filter((order) => order.status === OrderStatus.Pending));
	const [preparingOrders, setPreparingOrders] = useState<ActiveOrder[]>(allActiveOrders.filter((order) => order.status === OrderStatus.Preparing));
	const [readyOrders, setReadyOrders] = useState<ActiveOrder[]>(allActiveOrders.filter((order) => order.status === OrderStatus.Ready));

	/**
	 * Handler: handleToggleExpand
	 * Input:
	 * - orderId: string — The ID of the order to expand/collapse
	 *
	 * Description:
	 * Toggles the expanded state of an order card
	 */
	const handleToggleExpand = (orderId: string) => {
		setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
	};

	/**
	 * Function: updateOrderStatus
	 * Input:
	 * - order: ActiveOrder — The order to update
	 * - orderStatus: OrderStatus — New status for the order
	 *
	 * Description:
	 * Updates an order's status and syncs with WebSocket server
	 */
	const updateOrderStatus = (order: ActiveOrder, orderStatus: OrderStatus) => {
		const updatedOrder: ActiveOrder = { ...order, status: orderStatus };
		setOrder((prevOrders) => {
			const restaurantOrders = prevOrders.find((o) => o.restaurantId === restaurantId)?.orders || [];
			const mergedOrders = [...new Map([...restaurantOrders.filter((o) => o.id !== updatedOrder.id), updatedOrder].map((o) => [o.id, o])).values()];

			return {
				restaurantId,
				orders: mergedOrders,
			};
		});
	};

	// Update categorized orders when WebSocket data changes
	useEffect(() => {
		setPendingOrders(allActiveOrders.filter((order) => order.status === OrderStatus.Pending));
		setPreparingOrders(allActiveOrders.filter((order) => order.status === OrderStatus.Preparing));
		setReadyOrders(allActiveOrders.filter((order) => order.status === OrderStatus.Ready));
	}, [orders]);

	/**
	 * Function: renderOrderCard
	 * Input:
	 * - order: ActiveOrder — The order to render
	 *
	 * Output:
	 * - ReactNode — The rendered order card component
	 *
	 * Description:
	 * Renders an individual order card with:
	 * - Status-appropriate action buttons
	 * - Expandable details
	 * - Item and modification information
	 */
	const renderOrderCard = (order: ActiveOrder) => {
		const isExpanded = expandedOrderId === order.id;

		return (
			<div
				key={order.id}
				className="p-6 border border-gray-300 rounded-lg shadow-lg bg-white dark:bg-neutral-800 dark:border-neutral-700 text-lg space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<div className="font-bold text-xl text-gray-800 dark:text-white">Order #{order.id.slice(0, 8)}</div>
						<div className="text-gray-500 dark:text-gray-400 text-sm">Placed: {new Date(order.orderPlacedAt).toLocaleTimeString()}</div>
					</div>
					{order.status === OrderStatus.Pending && (
						<button
							className="px-4 py-2 bg-yellow-400 text-black rounded hover:opacity-80 transition"
							onClick={() => updateOrderStatus(order, OrderStatus.Preparing)}>
							Mark Preparing
						</button>
					)}
					{order.status === OrderStatus.Preparing && (
						<button
							className="px-4 py-2 bg-green-500 text-white rounded hover:opacity-80 transition"
							onClick={() => updateOrderStatus(order, OrderStatus.Ready)}>
							Mark Ready
						</button>
					)}
					{order.status === OrderStatus.Ready && (
						<button
							className="px-4 py-2 bg-green-500 text-white rounded hover:opacity-80 transition"
							onClick={() => updateOrderStatus(order, OrderStatus.Completed)}>
							Mark Completed
						</button>
					)}
				</div>

				<div className="text-md text-gray-800 dark:text-gray-200">
					{order.items.length} item{order.items.length > 1 ? "s" : ""}
				</div>

				<button className="text-blue-600 dark:text-blue-300 underline text-sm" onClick={() => handleToggleExpand(order.id)}>
					{isExpanded ? "Hide Details" : "View More"}
				</button>

				{isExpanded && (
					<div className="space-y-2 pt-2 border-t border-gray-200 dark:border-neutral-700">
						{order.items.map((item, idx) => (
							<div key={idx} className="text-base text-gray-900 dark:text-white">
								• {item.quantity}x {item.name}
								{(item.modifications?.length ?? 0) > 0 && (
									<div className="ml-4 text-sm text-gray-600 dark:text-gray-400">
										Mods: {item.modifications?.map((mod) => mod.name).join(", ")}
									</div>
								)}
								{item.customText && <div className="ml-4 text-sm italic text-gray-500 dark:text-gray-400">Note: {item.customText}</div>}
							</div>
						))}
						<div className="text-right font-semibold mt-2">Total: ${order.discountPrice.toFixed(2)}</div>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="w-full space-y-12">
			{/* Pending Orders Section */}
			{pendingOrders.length > 0 && (
				<section>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🕐 Pending Orders</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{pendingOrders.map(renderOrderCard)}</div>
				</section>
			)}

			{/* Preparing Orders Section */}
			{preparingOrders.length > 0 && (
				<section>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🍳 Preparing Orders</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{preparingOrders.map(renderOrderCard)}</div>
				</section>
			)}

			{/* Ready Orders Section */}
			{readyOrders.length > 0 && (
				<section>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">✅ Ready Orders</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{readyOrders.map(renderOrderCard)}</div>
				</section>
			)}

			{/* Empty State */}
			{pendingOrders.length === 0 && preparingOrders.length === 0 && readyOrders.length === 0 && (
				<div className="text-center text-gray-500 dark:text-gray-400 text-lg mt-10">No active orders right now.</div>
			)}
		</div>
	);
}

/**
 * Testing Notes:
 * - Verify WebSocket connection and real-time updates
 * - Test order status transitions (Pending → Preparing → Ready → Completed)
 * - Check order card expansion/collapse functionality
 * - Verify responsive grid layout at different screen sizes
 * - Test dark mode support
 * - Verify empty state rendering
 * - Check order item and modification display
 * - Test with multiple simultaneous orders
 * - Verify total price calculation
 * - Check timestamp formatting
 */
