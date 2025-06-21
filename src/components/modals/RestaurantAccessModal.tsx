/**
 * File: RestaurantAccessModal.tsx
 * Description: Modal for accessing restaurant admin interface in SwiftPOS by entering
 * a restaurant ID. Validates input and redirects to the restaurant admin page.
 * Author: William Anderson
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Type: RestaurantAccessModalProps
 *
 * Component props:
 * - isOpen: boolean — Controls modal visibility
 * - onClose: () => void — Callback to close the modal
 */
type RestaurantAccessModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

/**
 * Component: RestaurantAccessModal
 *
 * Input:
 * - Props as defined in RestaurantAccessModalProps
 *
 * Output:
 * - React component rendering restaurant access modal
 * - Redirects to restaurant admin page on valid input
 *
 * Description:
 * Provides a secure access point for restaurant administrators with:
 * - Restaurant ID input validation
 * - Warning messages for empty submissions
 * - Clean transition to admin interface
 * - Responsive design for all devices
 */
export default function RestaurantAccessModal({ isOpen, onClose }: RestaurantAccessModalProps) {
	// State for form inputs and validation
	const [restaurantId, setRestaurantId] = useState("");
	const [showWarning, setShowWarning] = useState(false);

	// Router for navigation
	const router = useRouter();

	/**
	 * Handler: handleBackdropClick
	 *
	 * Description:
	 * Closes modal when clicking outside the content area.
	 * Provides better UX by allowing quick dismissal.
	 */
	const handleBackdropClick = () => {
		onClose();
	};

	/**
	 * Handler: handleGoClick
	 *
	 * Description:
	 * Validates restaurant ID input and:
	 * 1. Shows warning if input is empty
	 * 2. Redirects to admin page if valid
	 * 3. Cleans up state and closes modal
	 */
	const handleGoClick = () => {
		if (restaurantId.trim() === "") {
			setShowWarning(true);
			setTimeout(() => setShowWarning(false), 5000);
			return;
		}

		router.push(`/restaurant/${restaurantId.trim()}/admin`);
		setRestaurantId("");
		onClose();
	};

	return (
		<div
			className={`fixed inset-0 z-[999] grid h-screen w-screen place-items-center
            bg-black/60 backdrop-blur-sm transition-opacity duration-300
            ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
			onClick={handleBackdropClick}>
			{/* Modal Content Container */}
			<div onClick={(e) => e.stopPropagation()} className="w-full max-w-md mx-4 bg-white text-black p-6 rounded-lg shadow-lg">
				<h2 className="text-3xl font-bold mb-4 text-center">Restaurant Access</h2>

				<div className="flex flex-col gap-4">
					{/* Restaurant ID Input */}
					<label htmlFor="restaurantId" className="block font-semibold text-black">
						Restaurant ID
					</label>
					<input
						id="restaurantId"
						type="text"
						value={restaurantId}
						onChange={(e) => setRestaurantId(e.target.value)}
						placeholder="Enter your restaurant ID"
						className="w-full rounded border border-gray-300 px-3 py-2 text-black"
					/>

					{/* Warning Message */}
					{showWarning && <p className="text-red-600 font-semibold mt-2 text-center">Please enter a restaurant ID to continue.</p>}

					{/* Action Buttons */}
					<div className="flex justify-end gap-3">
						<button onClick={onClose} className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 transition">
							Cancel
						</button>
						<button onClick={handleGoClick} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition">
							Go To Restaurant
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Testing Notes:
 * - Verify modal opens/closes based on isOpen prop
 * - Test with empty restaurant ID submission
 * - Test with valid restaurant ID submission
 * - Verify warning message appears/disappears correctly
 * - Check navigation to correct admin route
 * - Test input field behavior (trimming whitespace)
 * - Verify responsive behavior at different screen sizes
 * - Test accessibility (keyboard navigation, screen reader)
 * - Check click-outside-to-close functionality
 */
