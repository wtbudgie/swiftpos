/**
 * File: get-stripe.ts
 *
 * Description:
 * Stripe.js initialization utility for SwiftPOS payment processing.
 * Implements a singleton pattern to ensure Stripe is only loaded once
 * and provides a reusable promise-based interface throughout the application.
 *
 * Author: William Anderson
 */

import { Stripe, loadStripe } from "@stripe/stripe-js";

/**
 * Variable: stripePromise
 *
 * Description:
 * Cached promise for the Stripe instance.
 * Uses lazy initialization pattern to prevent multiple loads.
 */
let stripePromise: Promise<Stripe | null>;

/**
 * Function: getStripe
 *
 * Description:
 * Returns a promise that resolves with the Stripe instance.
 * Implements singleton pattern to ensure Stripe is only loaded once.
 *
 * Returns:
 * Promise<Stripe | null> - Promise resolving to Stripe instance or null if loading fails
 *
 * Behavior:
 * - Initializes Stripe on first call
 * - Returns cached promise on subsequent calls
 * - Requires NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable
 */
const getStripe = () => {
	if (!stripePromise) {
		stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
	}
	return stripePromise;
};

export default getStripe;

/**
 * Testing Notes:
 * - Verify Stripe loads successfully with valid publishable key
 * - Test behavior with invalid/missing publishable key
 * - Validate singleton behavior across multiple calls
 * - Check error handling for failed Stripe loads
 * - Verify proper TypeScript types are exported
 */
