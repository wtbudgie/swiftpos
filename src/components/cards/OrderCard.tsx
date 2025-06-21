/**
 * File: OrderCard.tsx
 * Description: React component displaying detailed order information for SwiftPOS users,
 * including restaurant name, order ID, timestamps, status, itemized list, pricing breakdown,
 * and functionality to generate a PDF receipt of the order.
 * Author: William Anderson
 */

"use client";

import React, { useEffect, useState } from "react";
import { Item } from "@/types/RestaurantType";
import { UserOrderReceipt, OrderStatus } from "@/types/OrderType";
import jsPDF from "jspdf";

type OrderCardProps = {
	onClick?: (item: Item) => void; // Optional callback triggered on item click (not used internally here)
	orderData: UserOrderReceipt; // Object containing all relevant order details
};

/**
 * Component: OrderCard
 * Input:
 *  - onClick (optional): function(Item) => void, callback for clicking an item
 *  - orderData: UserOrderReceipt, includes order ID, restaurant name, status, items, prices, timestamps
 * Output:
 *  - JSX element rendering order summary and items, with a button to export a PDF receipt
 *
 * Description:
 * Displays all pertinent information about a customer's order including status and items.
 * Formats order placed timestamp for readability.
 * Allows user to generate and download a detailed PDF receipt of the order.
 */
export default function OrderCard({ orderData }: OrderCardProps) {
	// State to store human-readable formatted order date/time string
	const [formattedDate, setFormattedDate] = useState("");

	// Effect to format the orderPlacedAt ISO timestamp to local date/time string whenever it changes
	useEffect(() => {
		setFormattedDate(new Date(orderData.orderPlacedAt).toLocaleString());
	}, [orderData.orderPlacedAt]);

	/**
	 * Function: generateReceiptPDF
	 * Input: none (uses orderData and formattedDate from closure)
	 * Output: void (triggers PDF file download)
	 *
	 * Description:
	 * Creates a PDF document using jsPDF library.
	 * Adds header, order details (restaurant, ID, date, status), itemized list, discount, and totals.
	 * Saves PDF file named "receipt-{orderId}.pdf" for user download.
	 */
	const generateReceiptPDF = () => {
		const doc = new jsPDF();

		doc.setFontSize(18);
		doc.text("Order Receipt", 20, 20);

		doc.setFontSize(12);
		doc.text(`Restaurant: ${orderData.restaurantName}`, 20, 30);
		doc.text(`Order ID: ${orderData.id}`, 20, 40);
		doc.text(`Placed: ${formattedDate}`, 20, 50);
		doc.text(`Status: ${orderData.status}`, 20, 60);

		doc.text("Items:", 20, 70);
		orderData.items.forEach((item, index) => {
			doc.text(`${item.quantity}× ${item.name} - $${item.totalPrice.toFixed(2)}`, 25, 80 + index * 10);
		});

		const offset = 80 + orderData.items.length * 10;
		doc.text(`Discount: -$${orderData.discountAmount.toFixed(2)}`, 20, offset + 10);
		doc.text(`Original Total: $${orderData.discountPrice.toFixed(2)}`, 20, offset + 20);
		doc.text(`Final Total: $${orderData.actualPrice.toFixed(2)}`, 20, offset + 30);

		doc.save(`receipt-${orderData.id}.pdf`);
	};

	// JSX render of order card UI
	return (
		<div className="w-full bg-white border border-gray-600 rounded-lg shadow-md p-6 mb-6">
			<div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 md:gap-0">
				<div>
					<h3 className="text-2xl font-bold text-slate-900">{orderData.restaurantName}</h3>
					<p className="mt-1 text-sm text-slate-600">
						<span className="font-semibold text-slate-800">Order ID:</span> {orderData.id}
					</p>
					<p className="text-sm text-slate-600">
						<span className="font-semibold text-slate-800">Placed:</span> {formattedDate}
					</p>
					<p className="text-sm text-slate-600">
						<span className="font-semibold text-slate-800">Status:</span>{" "}
						<span
							className={`font-semibold ${
								orderData.status === OrderStatus.Pending
									? "text-yellow-600"
									: orderData.status === OrderStatus.Ready
									? "text-green-600"
									: "text-red-600"
							}`}>
							{orderData.status}
						</span>
					</p>
				</div>
			</div>

			<div className="mt-5">
				<p className="text-lg font-semibold text-slate-800 mb-3 border-b border-gray-300 pb-2">Items Ordered</p>
				<ul className="space-y-2 text-base text-slate-700">
					{orderData.items.map((item, idx) => (
						<li key={idx} className="flex justify-between">
							<span>
								<span className="font-semibold">{item.quantity}×</span> {item.name}
							</span>
							<span className="font-mono">${item.totalPrice.toFixed(2)}</span>
						</li>
					))}
				</ul>
			</div>

			<div className="mt-6 flex justify-between text-sm text-slate-700">
				<p>
					<span className="font-semibold">Discount:</span> {orderData.discountAmount > 0 ? `–$${orderData.discountAmount.toFixed(2)}` : "—"}
				</p>
				<p>
					<span className="font-semibold">Original Total:</span> ${orderData.discountPrice.toFixed(2)}
				</p>
			</div>

			<div className="mt-2 text-right text-xl font-extrabold text-slate-900">Final Total: ${orderData.actualPrice.toFixed(2)}</div>

			<button
				onClick={generateReceiptPDF}
				className="w-full border bg-blue-600 hover:bg-blue-200 text-black py-3 rounded-md text-lg font-semibold transition cursor-pointer">
				View Full Receipt
			</button>
		</div>
	);
}

/**
 * Testing Notes:
 * - Verify that formattedDate updates correctly based on orderData.orderPlacedAt.
 * - Click "View Full Receipt" button generates and downloads a properly formatted PDF.
 * - Check PDF contents match the displayed order summary, including all items, prices, discounts, and totals.
 * - Test rendering with various order statuses and empty item lists.
 */
