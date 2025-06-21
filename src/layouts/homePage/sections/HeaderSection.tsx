/**
 * File: HeaderSection.tsx
 * Description:
 * Header component for SwiftPOS that displays welcome message and user controls.
 * Manages authentication state and modal visibility for:
 * - User registration
 * - Login
 * - Account settings
 * - Order history
 * Author: William Anderson
 */

"use client";
import { useState, useEffect } from "react";
import { User } from "next-auth";
import { History, UserCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

// Components
import AccountSettingsModal from "@/components/modals/AccountSettingsModal";
import LoginModal from "@/components/modals/LoginModal";
import RegisterModal from "@/components/modals/RegisterModal";
import OrderHistoryModal from "@/components/modals/OrderHistoryModal";

/**
 * Type: HeaderSectionProps
 *
 * Properties:
 * - user: User | null — Current authenticated user data
 * - registerOpen: boolean — Whether to show registration modal initially
 */
type HeaderSectionProps = {
	user: User | null;
	registerOpen: boolean;
};

/**
 * Component: HeaderSection
 *
 * Props:
 * - user: User | null
 * - registerOpen: boolean
 *
 * Description:
 * Provides the main header for the application with:
 * - Branding/welcome message
 * - User account controls
 * - Modal management for authentication flows
 *
 * Behavior:
 * - Automatically opens order history if session_id param exists
 * - Shows appropriate modals based on auth state
 * - Manages all modal visibility states
 */
export default function HeaderSection({ user, registerOpen }: HeaderSectionProps) {
	// Get URL search params for session handling
	const params = useSearchParams();
	const sessionId = params.get("session_id");

	// State for managing modal visibility
	const [isRegisterOpen, setRegisterOpen] = useState(registerOpen);
	const [isLoginOpen, setLoginOpen] = useState(false);
	const [isSettingsOpen, setSettingsOpen] = useState(false);
	const [isOrderHistoryOpen, setOrderHistoryOpen] = useState(false);

	/**
	 * Effect: Check for session_id parameter
	 *
	 * Description:
	 * Automatically opens order history modal when session_id is present in URL.
	 * This handles post-payment redirects from payment processors.
	 */
	useEffect(() => {
		if (sessionId) {
			setOrderHistoryOpen(true);
		}
	}, [sessionId]);

	return (
		<div className="flex justify-between items-center mb-6">
			{/* Application title/welcome message */}
			<h1 className="text-5xl font-bold text-black">Welcome to SwiftPOS</h1>

			{/* Modals (conditionally rendered based on auth state) */}
			{user && <RegisterModal isOpen={isRegisterOpen} onClose={() => setRegisterOpen(false)} userData={user} />}

			<LoginModal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} allowLoginBypass={true} />

			{user && <AccountSettingsModal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} userData={user} />}

			{user && <OrderHistoryModal isOpen={isOrderHistoryOpen} onClose={() => setOrderHistoryOpen(false)} userData={user} />}

			{/* User control buttons */}
			<div className="flex items-center gap-2">
				{/* Order history button */}
				<button
					onClick={() => {
						if (!user) return setLoginOpen(true);
						setOrderHistoryOpen(true);
					}}
					className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-300 text-black transition cursor-pointer"
					type="button"
					aria-label="View order history">
					<History style={{ fontSize: 28, transform: "scale(1.8)" }} />
				</button>

				{/* Account settings button */}
				<button
					className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-300 text-black transition cursor-pointer"
					onClick={() => {
						if (!user) return setLoginOpen(true);
						setSettingsOpen(true);
					}}
					aria-label="Account settings">
					<UserCircle style={{ fontSize: 28, transform: "scale(1.8)" }} />
				</button>
			</div>
		</div>
	);
}

/**
 * Testing Notes:
 * - Verify header renders correctly with/without authenticated user
 * - Test all button interactions:
 *   - Order history button shows login modal when unauthenticated
 *   - Order history button shows history modal when authenticated
 *   - Account button shows login modal when unauthenticated
 *   - Account button shows settings modal when authenticated
 * - Test automatic order history modal opening with session_id param
 * - Verify all modals can be properly closed
 * - Check responsive behavior at different screen sizes
 */
