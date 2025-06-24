/**
 * File: CheckoutModal.tsx
 * Description: React component providing a modal checkout interface using Stripe's Embedded Checkout for SwiftPOS.
 * Author: William Anderson
 */

import React, { useEffect, useState, useCallback } from "react";
import { Stripe } from "@stripe/stripe-js";
import { Elements, EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";

import { OrderedItem } from "@/types/OrderType";

/**
 * Type: CheckoutModalProps
 * Description: Props expected by CheckoutModal component.
 * Fields:
 * - isOpen: boolean — determines if the modal is visible.
 * - onClose: () => void — callback to close the modal.
 * - restaurantId: string — identifier for the restaurant processing payment.
 * - cartItems: OrderedItem[] — array of items currently in the cart.
 * - stripePromise: Promise<Stripe | null> — promise resolving to Stripe instance.
 */
type CheckoutModalProps = {
	isOpen: boolean;
	onClose: () => void;
	restaurantId: string;
	cartItems: OrderedItem[];
	stripePromise: Promise<Stripe | null>;
};

/**
 * Component: CheckoutModal
 * Input:
 * - Props of type CheckoutModalProps.
 *
 * Output:
 * - JSX.Element | null — Renders modal with Stripe embedded checkout or null if not open.
 *
 * Description:
 * - Displays a modal checkout interface triggered by isOpen.
 * - Fetches a client secret from the backend to initiate Stripe payment.
 * - Handles payment confirmation and error states.
 * - Uses EmbeddedCheckoutProvider and EmbeddedCheckout for the Stripe UI.
 * - Resets internal state on modal close.
 *
 * Notes on Data Types:
 * - clientSecret: string | null — stores payment intent secret from server.
 * - error: string | null — stores error messages related to payment initiation.
 * - confirmed: boolean — tracks whether payment succeeded.
 * - totalPriceCents: number — sum of all cart item totalPrice (assumed to be in cents).
 */
export default function CheckoutModal({ isOpen, onClose, restaurantId, cartItems, stripePromise }: CheckoutModalProps) {
	const [confirmed, setConfirmed] = useState(false);
	const [clientSecret, setClientSecret] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Function: fetchClientSecret
	 * Input: none (uses closure variables restaurantId and cartItems)
	 * Output: void (side effect: updates clientSecret or error state)
	 * Description: Calls backend API to create a payment intent and retrieve client secret for Stripe checkout.
	 * - Sends POST request with cart items as JSON body.
	 * - On success, sets clientSecret from response.
	 * - On failure, sets an error message.
	 */
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
			console.error(err);
			setError("Failed to initiate payment.");
		}
	}, [restaurantId, cartItems]);

	/**
	 * Effect: On modal open with non-empty cart, fetch client secret.
	 * Dependencies: isOpen, fetchClientSecret
	 */
	useEffect(() => {
		if (isOpen && cartItems.length > 0) {
			fetchClientSecret();
		}
	}, [isOpen, fetchClientSecret, cartItems.length]);

	/**
	 * Function: handleClose
	 * Description: Resets state and invokes parent close callback.
	 */
	const handleClose = async () => {
		setClientSecret(null);
		setConfirmed(false);
		setError(null);
		onClose();
	};

	// Render null if modal not open.
	if (!isOpen) return null;

	// Render checkout modal with Stripe Elements and embedded checkout UI.
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
						width: "90vw",
						height: "95vh",
						maxWidth: "100vw",
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

/**
 * Testing Notes:
 * - Verify modal appears/disappears based on isOpen prop.
 * - Test API POST call to /api/restaurant/{restaurantId}/payments sends cart correctly.
 * - Confirm clientSecret is set on successful API response.
 * - Test error state when API call fails.
 * - Validate embedded checkout renders with valid clientSecret.
 * - Confirm payment success triggers confirmation UI.
 * - Test modal closes reset state and call onClose prop.
 */
