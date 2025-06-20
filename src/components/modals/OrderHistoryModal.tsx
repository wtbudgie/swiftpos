"use client";

import React from "react";
import { User } from "@/types/UserType";
import OrderCard from "../cards/OrderCard";
import { OrderStatus } from "@/types/OrderType";

type OrderHistoryModalProps = {
	isOpen: boolean;
	onClose: () => void;
	userData: User;
};

export default function OrderHistoryModal({ isOpen, onClose, userData }: OrderHistoryModalProps) {
	const pendingOrders = userData.pastOrders.filter((order) => order.status === OrderStatus.Pending);
	const completedOrders = userData.pastOrders.filter((order) => order.status !== OrderStatus.Pending);

	return (
		<div
			className={`fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
				isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
			}`}>
			<div className="relative w-1/2 max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-md mx-4">
				<h2 className="text-2xl font-semibold text-slate-800 mb-6">Your Orders</h2>

				{pendingOrders.length === 0 && completedOrders.length === 0 ? (
					<p className="text-slate-500 text-center">No orders</p>
				) : (
					<>
						{pendingOrders.length > 0 && (
							<>
								<h3 className="text-lg font-medium text-slate-700 mb-2">Active Orders</h3>
								{pendingOrders.map((order) => (
									<React.Fragment key={order.id}>
										<OrderCard orderData={order} />
										<br />
									</React.Fragment>
								))}
							</>
						)}

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

				<div className="flex justify-end mt-6">
					<button onClick={onClose} className="rounded-md border py-2 px-4 text-sm text-slate-600 hover:bg-slate-100">
						Close
					</button>
				</div>
			</div>
		</div>
	);
}
