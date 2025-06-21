/**
 * File: RegisterModal.tsx
 * Description: User onboarding modal for SwiftPOS that collects additional user details
 * after initial authentication. Handles phone validation and profile completion.
 * Author: William Anderson
 */

"use client";

import React, { useState } from "react";
import { User } from "@/types/UserType";
import { logout } from "@/utils/authController";
import { useRouter } from "next/navigation";

/**
 * Type: RegisterModalProps
 *
 * Component props:
 * - isOpen: boolean — Controls modal visibility
 * - onClose: () => void — Callback to close the modal
 * - userData: User — Contains the authenticated user's basic information
 */
type RegisterModalProps = {
	isOpen: boolean;
	onClose: () => void;
	userData: User;
};

/**
 * Component: RegisterModal
 *
 * Input:
 * - Props as defined in RegisterModalProps
 *
 * Output:
 * - React component rendering registration form
 * - Updates user profile via API on submission
 *
 * Description:
 * Handles the user onboarding process with:
 * - Phone number validation (Australian format)
 * - Name collection with length constraints
 * - Email confirmation with logout option
 * - Form validation and error handling
 */
export default function RegisterModal({ isOpen, onClose, userData }: RegisterModalProps) {
	// Form state management
	const [firstName, setFirstName] = useState("");
	const [secondName, setSecondName] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [showWarning, setShowWarning] = useState(false);

	const router = useRouter();

	/**
	 * Handler: handleBackdropClick
	 *
	 * Description:
	 * Shows warning when clicking outside modal to prevent accidental closure
	 * during required onboarding process.
	 */
	const handleBackdropClick = () => {
		setShowWarning(true);
		setTimeout(() => setShowWarning(false), 5000);
	};

	/**
	 * Handler: handleSubmit
	 * Input:
	 * - e: React.FormEvent — Form submission event
	 *
	 * Description:
	 * Handles form submission by:
	 * 1. Preventing default form behavior
	 * 2. Validating phone number format
	 * 3. Sending user data to API endpoint
	 * 4. Handling success/error responses
	 */
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!isPhoneValid) {
			setShowWarning(true);
			return;
		}

		try {
			const response = await fetch("/api/user", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					firstName,
					secondName,
					phoneNumber,
					onboarded: true,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				console.error("Update failed:", data.message);
				setShowWarning(true);
				return;
			}

			userData = data.user;
			onClose(); // Close modal on success
		} catch (error) {
			console.error("Error updating user:", error);
			setShowWarning(true);
		}
	};

	// Phone number validation regex (Australian format)
	const phoneRegex = /^614\d{8}$/;
	const isPhoneValid = phoneRegex.test(phoneNumber);

	return (
		<div
			className={`fixed inset-0 z-[999] grid h-screen w-screen place-items-center
            bg-black/60 backdrop-blur-sm transition-opacity duration-300
            ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
			onClick={handleBackdropClick}>
			{/* Modal Content */}
			<div className="relative m-4 p-6 w-full max-w-md rounded-lg bg-(--color-white) shadow-lg text-black" onClick={(e) => e.stopPropagation()}>
				<form onSubmit={handleSubmit} className="flex flex-col gap-6 text-center">
					<h2 className="text-3xl font-bold mb-4">Finish Setting Up Account</h2>

					{/* Email Field (Read-only) */}
					<div>
						<label htmlFor="email" className="block font-semibold text-left text-black">
							Email
						</label>
						<p className="text-xs text-gray-700 text-left mb-1">
							Your email address (If this is incorrect,{" "}
							<button
								type="button"
								onClick={() => {
									logout();
									router.refresh();
								}}
								className="text-blue-600 hover:underline underline-offset-2 p-0 m-0 bg-transparent border-none">
								click here
							</button>
							.)
						</p>
						<input
							id="email"
							type="email"
							value={userData?.email}
							disabled
							className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 cursor-not-allowed text-black"
						/>
					</div>

					{/* Phone Number Field */}
					<div>
						<label htmlFor="phone" className="block font-semibold text-left text-black">
							Phone Number
						</label>
						<p className="text-xs text-gray-700 text-left mb-1">Your best contact phone number. (Format: 614XXXXXXXX)</p>
						<input
							id="phone"
							type="text"
							value={phoneNumber}
							onChange={(e) => setPhoneNumber(e.target.value)}
							className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 text-black"
						/>
						{phoneNumber && !isPhoneValid && <p className="text-red-600 text-xs mt-1">Phone must be in format 614XXXXXXXX.</p>}
					</div>

					{/* Name Fields */}
					<div className="flex gap-4">
						<div className="flex-1">
							<label htmlFor="firstName" className="block font-semibold text-left text-black">
								First Name
							</label>
							<p className="text-xs text-gray-700 text-left mb-1">Please enter your preferred name.</p>
							<input
								id="firstName"
								type="text"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 text-black"
								title="First name."
								required
								maxLength={10}
							/>
						</div>
						<div className="flex-1">
							<label htmlFor="surname" className="block font-semibold text-left text-black">
								Surname
							</label>
							<p className="text-xs text-gray-700 text-left mb-1">Please enter your preferred surname.</p>
							<input
								id="surname"
								type="text"
								value={secondName}
								onChange={(e) => setSecondName(e.target.value)}
								className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 text-black"
								title="Surname."
								required
								maxLength={10}
							/>
						</div>
					</div>

					{/* Submit Button */}
					<button type="submit" className="bg-(--color-steel-blue) text-white py-2 rounded hover:bg-blue-700 transition cursor-pointer">
						Save Details
					</button>

					{/* Warning Messages */}
					{showWarning && <p className="text-red-600 font-semibold mt-2">Please finish registering to continue.</p>}

					{/* Support Link */}
					<div className="text-sm text-gray-800">
						<p>Need Support?</p>
						<p className="text-blue-600 cursor-pointer hover:underline">contact here</p>
					</div>
				</form>
			</div>
		</div>
	);
}

/**
 * Testing Notes:
 * - Verify modal opens/closes based on isOpen prop
 * - Test phone number validation with various formats
 * - Test name field length constraints
 * - Verify email field is read-only
 * - Test logout functionality
 * - Verify form submission with valid/invalid data
 * - Check error handling for API failures
 * - Test responsive behavior at different screen sizes
 * - Verify accessibility (keyboard navigation, screen reader compatibility)
 */
