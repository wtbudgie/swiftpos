/**
 * File: HeaderSection.tsx
 * Description:
 * Header component for SwiftPOS admin interface that provides:
 * - User account controls
 * - Search functionality
 * - Modal management for authentication and user flows
 * Author: William Anderson
 */

"use client";
import { useState } from "react";
import { User } from "next-auth";
import { CircleUserRound, History } from "lucide-react";

// Components
import AccountSettingsModal from "@/components/modals/AccountSettingsModal";
import LoginModal from "@/components/modals/LoginModal";
import OrderHistoryModal from "@/components/modals/OrderHistoryModal";
import RegisterModal from "@/components/modals/RegisterModal";
import SearchBar from "@/components/inputs/SearchBar";

/**
 * Type: HeaderSectionProps
 *
 * Properties:
 * - user: User | null — Current authenticated user data
 * - registerOpen: boolean — Whether to show registration modal initially
 * - searchQuery: string — Current search query value
 * - setSearchQuery: (value: string) => void — Handler for search query updates
 */
type HeaderSectionProps = {
	user: User | null;
	registerOpen: boolean;
	searchQuery: string;
	setSearchQuery: (value: string) => void;
};

/**
 * Component: HeaderSection
 *
 * Props:
 * - user: User | null
 * - registerOpen: boolean
 * - searchQuery: string
 * - setSearchQuery: function
 *
 * Description:
 * Provides the main header navigation for admin interface with:
 * - User account and settings controls
 * - Order history access
 * - Full-width search functionality
 * - Modal management for user flows
 *
 * Behavior:
 * - Manages visibility of all user-related modals
 * - Handles search input changes
 * - Adapts based on authentication state
 */
export default function HeaderSection({ user, registerOpen, searchQuery, setSearchQuery }: HeaderSectionProps) {
	// State for managing modal visibility
	const [isRegisterOpen, setRegisterOpen] = useState(registerOpen);
	const [isLoginOpen, setLoginOpen] = useState(!user);
	const [isSettingsOpen, setSettingsOpen] = useState(false);
	const [isOrderHistoryOpen, setOrderHistoryOpen] = useState(false);

	return (
		<div className="bg-transparent p-6 rounded-md">
			{/* User Registration Modal */}
			{user && <RegisterModal isOpen={isRegisterOpen} onClose={() => setRegisterOpen(false)} userData={user} />}

			{/* Login Modal */}
			<LoginModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} allowLoginBypass={false} />

			{/* Account Settings Modal */}
			{user && <AccountSettingsModal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} userData={user} />}

			{/* Order History Modal */}
			{user && <OrderHistoryModal isOpen={isOrderHistoryOpen} onClose={() => setOrderHistoryOpen(false)} userData={user} />}

			{/* Header Content */}
			<div className="flex items-center gap-2">
				{/* Account Settings Button */}
				<button
					onClick={() => setSettingsOpen(true)}
					className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-300 text-black transition"
					type="button"
					aria-label="Account settings">
					<CircleUserRound />
				</button>

				{/* Order History Button */}
				<button
					onClick={() => setOrderHistoryOpen(true)}
					className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-300 text-black transition"
					type="button"
					aria-label="Order history">
					<History />
				</button>

				{/* Search Bar - Takes remaining space */}
				<div className="flex-1 ml-4">
					<SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} disabled={false} />
				</div>
			</div>
		</div>
	);
}

/**
 * Testing Notes:
 * - Verify all buttons render correctly with proper icons
 * - Test search functionality updates query state
 * - Check all modals open/close properly:
 *   - Account settings modal
 *   - Order history modal
 *   - Registration modal (when user exists)
 *   - Login modal (when no user)
 * - Validate responsive behavior at different screen sizes
 * - Confirm proper aria-labels for accessibility
 */
