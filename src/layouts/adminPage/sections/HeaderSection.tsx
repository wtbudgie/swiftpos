/**
 * File: HeaderSection.tsx
 * Description: Header navigation component for SwiftPOS with user controls and search functionality.
 * Contains modal triggers for account management and order history.
 * Author: William Anderson
 */

"use client";

import { useState } from "react";
import { CircleUserRound, History, SlidersHorizontal } from "lucide-react";
import AccountSettingsModal from "@/components/modals/AccountSettingsModal";
import LoginModal from "@/components/modals/LoginModal";
import OrderHistoryModal from "@/components/modals/OrderHistoryModal";
import RegisterModal from "@/components/modals/RegisterModal";
import SearchBar from "@/components/inputs/SearchBar";
import { User } from "@/types/UserType";

/**
 * Type: HeaderSectionProps
 *
 * Component props:
 * - user: User — Current authenticated user data
 * - registerOpen: boolean — Controls initial visibility of registration modal
 * - searchDisabled: boolean — Disables search bar when true
 */
type HeaderSectionProps = {
	user: User;
	registerOpen: boolean;
	searchDisabled: boolean;
};

/**
 * Component: HeaderSection
 *
 * Input:
 * - Props as defined in HeaderSectionProps
 *
 * Output:
 * - React component rendering header navigation
 *
 * Description:
 * Provides main navigation header with:
 * - User account controls
 * - Order history access
 * - Search functionality
 * - Modal management for user flows
 * - Responsive layout
 */
export default function HeaderSection({ user, registerOpen, searchDisabled }: HeaderSectionProps) {
	// Modal state management
	const [isRegisterOpen, setRegisterOpen] = useState(registerOpen);
	const [isLoginOpen, setLoginOpen] = useState(false);
	const [isSettingsOpen, setSettingsOpen] = useState(false);
	const [isOrderHistoryOpen, setOrderHistoryOpen] = useState(false);

	return (
		<div className="bg-transparent p-6 rounded-md">
			{/* Modal Components */}
			<RegisterModal isOpen={isRegisterOpen} onClose={() => setRegisterOpen(false)} userData={user} />
			<LoginModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} allowLoginBypass={true} />
			<AccountSettingsModal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} userData={user} />
			<OrderHistoryModal isOpen={isOrderHistoryOpen} onClose={() => setOrderHistoryOpen(false)} userData={user} />

			{/* Header Navigation Bar */}
			<div className="flex items-center gap-2">
				{/* Navigation Buttons */}
				<button
					onClick={() => setSettingsOpen(true)}
					className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-300 text-black transition"
					type="button"
					aria-label="Account settings">
					<CircleUserRound />
				</button>

				<button
					onClick={() => setOrderHistoryOpen(true)}
					className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-300 text-black transition"
					type="button"
					aria-label="Order history">
					<History />
				</button>

				<button className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-300 text-black transition" aria-label="Settings">
					<SlidersHorizontal />
				</button>

				{/* Search Bar */}
				<div className="flex-1 ml-4">
					<SearchBar onChange={() => {}} value="" disabled={searchDisabled} />
				</div>
			</div>
		</div>
	);
}

/**
 * Testing Notes:
 * - Verify all modal open/close functionality
 * - Test with authenticated/unauthenticated users
 * - Check responsive behavior at different screen sizes
 * - Verify search bar disabled state
 * - Test accessibility (keyboard navigation, screen readers)
 * - Check icon button hover states
 * - Verify initial register modal state
 * - Test with various user data states
 * - Check dark mode compatibility
 * - Verify modal stacking behavior
 */
