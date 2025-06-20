"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Stripe } from "@stripe/stripe-js";
import { Elements, EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";

import { OrderedItem } from "@/types/OrderType";

type CheckoutModalProps = {
	isOpen: boolean;
	onClose: () => void;
	restaurantId: string;
	cartItems: OrderedItem[];
	stripePromise: Promise<Stripe | null>;
};

export default function CheckoutModal({ isOpen, onClose, restaurantId, cartItems, stripePromise }: CheckoutModalProps) {
	const [confirmed, setConfirmed] = useState(false);
	const [clientSecret, setClientSecret] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const totalPriceCents = cartItems.reduce((acc, i) => acc + i.totalPrice, 0);

	const fetchClientSecret = useCallback(async () => {
		try {
			const res = await fetch(`/api/restaurant/${restaurantId}/payments`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ cart: cartItems }),
			});
			const data = await res.json();
			setClientSecret(data.client_secret);
		} catch (err) {
			setError("Failed to initiate payment.");
		}
	}, [restaurantId, cartItems]);

	useEffect(() => {
		if (isOpen && cartItems.length > 0) {
			fetchClientSecret();
		}
	}, [isOpen, fetchClientSecret]);

	const handlePaymentSuccess = () => {
		setConfirmed(true);
	};

	const handleClose = async () => {
		setClientSecret(null);
		setConfirmed(false);
		setError(null);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<Elements stripe={stripePromise}>
			<div
				className={`fixed inset-0 z-[999] grid place-items-center
        bg-black/60 backdrop-blur-sm
        transition-opacity duration-300
        ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
				onClick={handleClose}>
				<div
					className="relative m-4 rounded-lg bg-white shadow-lg overflow-hidden"
					style={{
						width: "90vw", // Fixed wider width
						height: "95vh", // Original height
						maxWidth: "100vw", // Ensure it doesn't overflow on mobile
					}}
					onClick={(e) => e.stopPropagation()}>
					{!confirmed ? (
						<div className="h-full flex flex-col">
							<h2 className="text-xl font-semibold text-gray-800 p-6 pt-8">Checkout</h2>
							<button
								onClick={handleClose}
								className="absolute top-4 right-4 z-10 text-gray-400 hover:text-black text-2xl leading-none"
								aria-label="Close modal">
								✕
							</button>
							{clientSecret ? (
								<div className="flex-1 overflow-hidden">
									<div className="h-full overflow-y-auto px-6 pb-6">
										<EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
											<EmbeddedCheckout className="w-full" />
										</EmbeddedCheckoutProvider>
									</div>
								</div>
							) : (
								<div className="flex-1 flex items-center justify-center">
									<p className="text-sm text-gray-500">Preparing checkout...</p>
								</div>
							)}

							{error && (
								<div className="px-6 py-2">
									<p className="text-red-600 text-sm">{error}</p>
								</div>
							)}
						</div>
					) : (
						<div className="h-full flex flex-col items-center justify-center p-8 text-center">
							<h2 className="text-2xl font-bold text-green-600 mb-2">Order Confirmed!</h2>
							<p className="text-sm text-gray-600 mb-4">Thanks for your order. The restaurant is now processing it.</p>
							<button
								onClick={() => {
									setConfirmed(false);
									onClose();
								}}
								className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition">
								Close
							</button>
						</div>
					)}
				</div>
			</div>
		</Elements>
	);
}
