/**
 * File: PastOrdersListPage.tsx
 * Description: Displays completed orders for a restaurant in SwiftPOS.
 * Provides view-only access to past order details with expandable item information.
 * Author: William Anderson
 * Created: 2025-06-21
 */

"use client";

import { useEffect, useState } from "react";
import { ActiveOrder, OrderStatus } from "@/types/OrderType";
import { SanitizedRestaurant } from "@/app/restaurant/[restaurantId]/admin/page";
import { useActiveOrders } from "@/components/SocketComponent";

/**
 * Type: PastOrdersListPageProps
 *
 * Component props:
 * - restaurantData: SanitizedRestaurant — Contains restaurant information including ID
 */
type PastOrdersListPageProps = {
	restaurantData: SanitizedRestaurant;
};

/**
 * Component: PastOrdersListPage
 *
 * Input:
 * - Props as defined in PastOrdersListPageProps
 *
 * Output:
 * - React component rendering completed orders list
 *
 * Description:
 * Displays historical completed orders with:
 * - Order summary information
 * - Expandable item details
 * - Responsive grid layout
 * - Dark mode support
 */
export default function PastOrdersListPage({ restaurantData }: PastOrdersListPageProps) {
	const restaurantId = restaurantData._id;

	// WebSocket connection for real-time order updates
	const [orders, setOrder] = useActiveOrders(() => `ws://${window.location.host}/api/restaurant/${restaurantId}/orders`);

	// UI state for expanded order details
	const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

	// Flatten all orders from different restaurants
	const allActiveOrders = orders.flatMap((o) => o.orders);

	// Filter completed orders
	const [completedOrders, setCompletedOrders] = useState<ActiveOrder[]>(allActiveOrders.filter((order) => order.status === OrderStatus.Completed));

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
	 * Note: Included for consistency but not used for completed orders
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

	// Update completed orders when WebSocket data changes
	useEffect(() => {
		setCompletedOrders(allActiveOrders.filter((order) => order.status === OrderStatus.Completed));
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
	 * Renders an individual completed order card with:
	 * - Basic order information
	 * - Expandable item details
	 * - Modification and note display
	 * - Total price calculation
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
			{/* Completed Orders Section */}
			{completedOrders.length > 0 && (
				<section>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">✅ Completed Orders</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{completedOrders.map(renderOrderCard)}</div>
				</section>
			)}

			{/* Empty State */}
			{completedOrders.length === 0 && <div className="text-center text-gray-500 dark:text-gray-400 text-lg mt-10">No completed orders found.</div>}
		</div>
	);
}

/**
 * Testing Notes:
 * - Verify display of completed orders
 * - Test order card expansion/collapse functionality
 * - Check responsive grid layout at different screen sizes
 * - Verify dark mode support
 * - Test with multiple completed orders
 * - Check timestamp formatting
 * - Verify item and modification display
 * - Test empty state rendering
 * - Verify total price calculation
 */
