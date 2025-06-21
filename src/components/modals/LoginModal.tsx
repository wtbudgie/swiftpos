/**
 * File: LoginModal.tsx
 * Description: Authentication modal for SwiftPOS that handles email-based login/registration.
 * Provides secure access control with optional bypass capability for development/testing.
 * Author: William Anderson
 */

"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { usePathname } from "next/navigation";

/**
 * Type: LoginModalProps
 *
 * Component props:
 * - isOpen: boolean — Controls modal visibility
 * - onClose: () => void — Callback to close the modal
 * - allowLoginBypass: boolean — Development flag to enable clicking outside to close
 */
type LoginModalProps = {
	isOpen: boolean;
	onClose: () => void;
	allowLoginBypass: boolean;
};

/**
 * Component: LoginModal
 *
 * Input:
 * - Props as defined in LoginModalProps
 *
 * Output:
 * - React component rendering authentication modal
 * - Calls NextAuth's signIn when form submitted
 *
 * Description:
 * Handles user authentication flow with:
 * - Email input validation
 * - Loading state during authentication
 * - Error handling and display
 * - Conditional backdrop click behavior
 * - Path-aware redirection after login
 */
export default function LoginModal({ isOpen, onClose, allowLoginBypass }: LoginModalProps) {
	// Form state management
	const [email, setEmail] = useState("");
	const [showWarning, setShowWarning] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// Get current path for post-login redirection
	const pathname = usePathname();

	/**
	 * Handler: handleBackdropClick
	 *
	 * Description:
	 * Controls modal closing behavior based on allowLoginBypass flag:
	 * - In development (allowLoginBypass=true): closes modal immediately
	 * - In production: shows warning message about required login
	 */
	const handleBackdropClick = () => {
		if (allowLoginBypass) onClose();
		else {
			setShowWarning(true);
			setTimeout(() => setShowWarning(false), 5000);
		}
	};

	/**
	 * Handler: handleLogin
	 * Input:
	 * - e: React.FormEvent — Form submission event
	 *
	 * Description:
	 * Handles the login form submission by:
	 * 1. Preventing default form behavior
	 * 2. Initiating loading state
	 * 3. Calling NextAuth's email sign-in
	 * 4. Handling success/error states
	 * 5. Maintaining the current path for post-login redirection
	 */
	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			await signIn("email", {
				email,
				redirect: true,
				callbackUrl: pathname,
			});
		} catch (err) {
			console.error(err);
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className={`fixed inset-0 z-[999] grid h-screen w-screen place-items-center
            bg-black/60 backdrop-blur-sm transition-opacity duration-300
            ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
			onClick={handleBackdropClick}>
			{/* Modal Content */}
			<div onClick={(e) => e.stopPropagation()} className="w-full max-w-md mx-4 bg-(--color-white) text-(--color-black) p-6 rounded-lg shadow-lg">
				<form onSubmit={handleLogin} className="flex flex-col items-center gap-6 text-center">
					<h2 className="text-3xl font-bold">Welcome!</h2>
					<p className="text-sm text-(--color-gray)">Enter your email to log in or create an account.</p>

					{/* Email Input */}
					<div className="w-full">
						<label htmlFor="email" className="block font-semibold text-left text-(--color-black)">
							Email
						</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="w-full rounded border border-(--color-steel-blue) px-3 py-2 text-black"
						/>
					</div>

					{/* Submit Button */}
					<button
						type="submit"
						disabled={loading}
						className="w-full bg-(--color-steel-blue) text-white py-2 rounded hover:bg-(--color-ice-blue) hover:outline hover:text-(--color-black) transition">
						{loading ? "Logging in..." : "Login or Register with Email"}
					</button>

					{/* Error/Warning Messages */}
					{error && <p className="text-red-600 font-semibold mt-2">{error}</p>}
					{showWarning && <p className="text-red-600 font-semibold mt-2">Please enter your email to continue.</p>}

					{/* Support Link */}
					<div className="text-sm text-(--color-black) mt-2 text-center">
						<p>Need help?</p>
						<p className="text-(--color-steel-blue) cursor-pointer hover:underline">Contact support!</p>
					</div>
				</form>
			</div>
		</div>
	);
}

/**
 * Testing Notes:
 * - Verify modal opens/closes based on isOpen prop
 * - Test email validation and submission
 * - Verify loading state during authentication
 * - Test error handling with invalid inputs
 * - Check backdrop click behavior in both dev/prod modes
 * - Verify pathname is preserved after login
 * - Test support link functionality
 * - Check responsive behavior at different screen sizes
 * - Verify accessibility (keyboard navigation, ARIA labels)
 */
