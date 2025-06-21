/**
 * File: FooterSectionModal.tsx
 * Description:
 * Persistent footer component for SwiftPOS that appears at the bottom of the page.
 * Contains calls-to-action for restaurant owners and links to legal/support pages.
 * Manages the restaurant access modal state and display.
 * Author: William Anderson
 */

"use client";

import { useState } from "react";
import RestaurantAccessModal from "@/components/modals/RestaurantAccessModal";

/**
 * Component: FooterSectionModal
 *
 * Description:
 * Fixed-position footer that remains visible at the bottom of the viewport.
 * Provides:
 * - Restaurant registration call-to-action
 * - Access to the restaurant access modal
 * - Quick links to legal and support pages
 *
 * State Management:
 * - isRestaurantAccessOpen: boolean — controls visibility of restaurant access modal
 */
export default function FooterSectionModal() {
	// Controls visibility of the restaurant access modal
	const [isRestaurantAccessOpen, setRestaurantAccessOpen] = useState(false);

	return (
		<div className="fixed bottom-0 left-0 w-full bg-(--color-black) shadow-md px-6 py-4">
			<div className="flex flex-col items-center justify-center text-center space-y-2">
				{/* Primary action buttons row */}
				<div className="flex items-center gap-4">
					{/* Restaurant invitation text */}
					<span className="text-sm text-white whitespace-nowrap">Want to add your restaurant?</span>

					{/* Contact button (currently placeholder functionality) */}
					<button
						className="bg-(--color-steel-blue) hover:bg-(--color-ice-blue) color-white hover:text-(--color-black) px-4 py-2 rounded-md transition cursor-not-allowed"
						onClick={() => alert("Contact form coming soon!")}>
						Get in contact
					</button>

					{/* Visual separator */}
					<div className="h-6 w-px bg-gray-300 mx-4" />

					{/* Restaurant Access Modal (hidden by default) */}
					<RestaurantAccessModal
						isOpen={isRestaurantAccessOpen}
						onClose={() => {
							setRestaurantAccessOpen(false);
						}}
					/>

					{/* Button to open restaurant access modal */}
					<button
						className="bg-(--color-steel-blue) hover:bg-(--color-ice-blue) color-white hover:text-(--color-black) px-4 py-2 rounded-md transition cursor-pointer"
						onClick={() => setRestaurantAccessOpen(true)}>
						Restaurant Access
					</button>
				</div>

				{/* Decorative divider */}
				<div className="w-1/3 border-t border-(--color-white) my-2" />

				{/* Legal and support links */}
				<div className="flex gap-6 text-sm text-(--color-ice-blue) font-bold cursor-pointer">
					<a href="#" className="hover:underline cursor-not-allowed">
						Privacy Policy
					</a>
					<a href="#" className="hover:underline cursor-not-allowed">
						Terms of Service
					</a>
					<a href="#" className="hover:underline cursor-not-allowed">
						Contact Support
					</a>
				</div>
			</div>
		</div>
	);
}

/**
 * Testing Notes:
 * - Verify footer renders correctly at bottom of viewport
 * - Test "Restaurant Access" button opens modal
 * - Check modal closes properly via onClose handler
 * - Validate hover states on all interactive elements
 * - Confirm all links are properly styled
 * - Test responsive behavior at different screen widths
 *
 */
