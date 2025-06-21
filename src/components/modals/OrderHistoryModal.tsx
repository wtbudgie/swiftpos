/**
 * File: OrderHistoryModal.tsx
 * Description: Displays a user's order history in SwiftPOS, separating active and completed orders.
 * Provides a comprehensive view of past transactions with status tracking.
 * Author: William Anderson
 */

"use client";

import React from "react";
import { User } from "@/types/UserType";
import OrderCard from "../cards/OrderCard";
import { OrderStatus } from "@/types/OrderType";

/**
 * Type: OrderHistoryModalProps
 *
 * Component props:
 * - isOpen: boolean — Controls modal visibility
 * - onClose: () => void — Callback to close the modal
 * - userData: User — Contains the user's order history data
 */
type OrderHistoryModalProps = {
	isOpen: boolean;
	onClose: () => void;
	userData: User;
};

/**
 * Component: OrderHistoryModal
 *
 * Input:
 * - Props as defined in OrderHistoryModalProps
 *
 * Output:
 * - React component rendering order history modal
 *
 * Description:
 * Displays a user's order history with:
 * - Separation of pending vs completed orders
 * - Responsive layout for different screen sizes
 * - Visual distinction between order statuses
 * - Empty state handling
 */
export default function OrderHistoryModal({ isOpen, onClose, userData }: OrderHistoryModalProps) {
	const sortedOrders = [...userData.pastOrders].sort((a, b) => {
		return new Date(b.orderPlacedAt).getTime() - new Date(a.orderPlacedAt).getTime();
	});

	const activeOrders = sortedOrders.filter((order) => order.status !== OrderStatus.Completed);
	const completedOrders = sortedOrders.filter((order) => order.status == OrderStatus.Completed);

	return (
		<div
			className={`fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
				isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
			}`}
			onClick={onClose} // Close modal when clicking outside
		>
			{/* Modal Content Container */}
			<div
				className="relative w-1/2 max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-md mx-4"
				onClick={(e) => e.stopPropagation()} // Prevent click propagation
			>
				{/* Modal Header */}
				<h2 className="text-2xl font-semibold text-slate-800 mb-6">Your Orders</h2>

				{/* Empty State Handling */}
				{activeOrders.length === 0 && completedOrders.length === 0 ? (
					<p className="text-slate-500 text-center">No orders</p>
				) : (
					<>
						{/* Active Orders Section */}
						{activeOrders.length > 0 && (
							<>
								<h3 className="text-lg font-medium text-slate-700 mb-2">Active Orders</h3>
								{activeOrders.map((order) => (
									<React.Fragment key={order.id}>
										<OrderCard orderData={order} />
										<br />
									</React.Fragment>
								))}
							</>
						)}

						{/* Completed Orders Section */}
						{completedOrders.length > 0 && (
							<>
								<h3 className="text-lg font-medium text-slate-700 mt-6 mb-2">Past Orders</h3>
								{completedOrders.map((order) => (
									<React.Fragment key={order.id}>
										<OrderCard orderData={order} />
										<br />
									</React.Fragment>
								))}
							</>
						)}
					</>
				)}

				{/* Modal Footer */}
				<div className="flex justify-end mt-6">
					<button onClick={onClose} className="rounded-md border py-2 px-4 text-sm text-slate-600 hover:bg-slate-100">
						Close
					</button>
				</div>
			</div>
		</div>
	);
}

/**
 * Testing Notes:
 * - Verify modal opens/closes based on isOpen prop
 * - Test with users having no orders
 * - Test with users having only pending orders
 * - Test with users having only completed orders
 * - Test with users having mixed order statuses
 * - Verify scroll behavior with many orders
 * - Check responsive behavior at different screen sizes
 * - Verify click-outside-to-close functionality
 * - Test accessibility (keyboard navigation, screen reader compatibility)
 */
