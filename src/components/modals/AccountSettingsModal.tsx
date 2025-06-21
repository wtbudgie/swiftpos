/**
 * File: AccountSettingsModal.tsx
 * Description: React client component rendering a modal to allow users to update their account details
 * (first name, surname, phone number) and log out of SwiftPOS.
 * Author: William Anderson
 */

"use client";

import React, { useState } from "react";
import { User } from "@/types/UserType";
import { useRouter } from "next/navigation";
import { logout } from "@/utils/authController";

type AccountSettingsModalProps = {
	isOpen: boolean; // Controls visibility of the modal
	onClose: () => void; // Callback to close the modal
	userData: User; // User data object containing current account info
};

/**
 * Component: AccountSettingsModal
 *
 * Purpose:
 * Renders a modal popup that allows the user to view and edit their account details.
 * It handles form submission to update user info via API and offers logout functionality.
 *
 * Inputs:
 * - isOpen: boolean - Whether the modal is shown or hidden.
 * - onClose: function - Function to close the modal.
 * - userData: User - Object containing user's current profile data.
 *
 * Outputs:
 * - JSX element representing the modal UI.
 *
 * Behaviour:
 * - Initializes state with user's existing first name, surname, and phone number.
 * - Disables editing of email (display only).
 * - On submit, sends updated data to the server via a PUT request to "/api/user".
 * - Displays warning if update fails.
 * - Closes modal on successful update.
 * - Allows user to log out, which refreshes the router state.
 */
export default function AccountSettingsModal({ isOpen, onClose, userData }: AccountSettingsModalProps) {
	// State hooks for editable user details with default fallbacks
	const [firstName, setFirstName] = useState(userData?.firstName ?? "");
	const [secondName, setSecondName] = useState(userData?.secondName ?? "");
	const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber ?? "");
	const [showWarning, setShowWarning] = useState(false);

	const router = useRouter();

	// Return null to avoid rendering if no user data is present (failsafe)
	if (!userData) return null;

	/**
	 * Function: handleSubmit
	 * Input:
	 * - e: React.FormEvent<HTMLFormElement> - form submission event
	 *
	 * Output:
	 * - void (side effects: API call and UI updates)
	 *
	 * Description:
	 * Prevents default form submission, sends updated user info to the backend.
	 * On success, updates userData locally and closes modal.
	 * On failure, sets warning state to notify the user.
	 */
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

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
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				console.error("Update failed:", data.message);
				setShowWarning(true);
				return;
			}

			// Update local userData with returned user object from API
			userData = data.user;
			onClose(); // Close modal on success
		} catch (error) {
			console.error("Error updating user:", error);
			setShowWarning(true);
		}
	};

	return (
		// Modal container, toggles visibility and disables interaction when closed
		<div
			className={`fixed inset-0 z-[999] grid h-screen w-screen place-items-center
            bg-black/60
            backdrop-blur-sm
            transition-opacity duration-300
			${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
			onClick={onClose}>
			{/* Inner modal content container, stops click event propagation to prevent modal close */}
			<div className="relative m-4 p-6 w-full max-w-md rounded-lg bg-(--color-white) shadow-lg text-black" onClick={(e) => e.stopPropagation()}>
				{/* Form for updating account details */}
				<form onSubmit={handleSubmit} className="flex flex-col gap-6 text-center">
					<h2 className="text-3xl font-bold mb-4">Edit Account Details</h2>

					{/* Display email as read-only input */}
					<div>
						<label htmlFor="email" className="block font-semibold text-left text-black">
							Email
						</label>
						<p className="text-xs text-gray-700 text-left mb-1">Your email address</p>
						<input
							id="email"
							type="email"
							value={userData.email}
							disabled
							className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 cursor-not-allowed text-black"
						/>
					</div>

					{/* Editable phone number input */}
					<div>
						<label htmlFor="phone" className="block font-semibold text-left text-black">
							Phone Number
						</label>
						<p className="text-xs text-gray-700 text-left mb-1">Your best contact phone number. (Format: 614XXXXXXXX)</p>
						<input
							id="phone"
							type="tel"
							value={phoneNumber}
							onChange={(e) => {
								const value = e.target.value;
								const digitsOnly = value.replace(/\D/g, "").slice(0, 11);
								if (digitsOnly === "" || digitsOnly.startsWith("614")) {
									setPhoneNumber(digitsOnly);
								}
							}}
							className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 text-black"
							maxLength={11}
							pattern="^614\d{8}$"
						/>
					</div>

					{/* Editable first and last name inputs side by side */}
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

					{/* Submit button to save changes */}
					<button type="submit" className="bg-(--color-steel-blue) text-white py-2 rounded hover:bg-blue-700 transition">
						Save Details
					</button>

					{/* Button to log out user and refresh the page */}
					<button
						type="button"
						onClick={() => {
							logout();
							router.refresh();
						}}
						className="bg-red-600 text-white py-2 rounded hover:bg-red-700 transition">
						Log Out
					</button>

					{/* Warning message shown when update fails */}
					{showWarning && <p className="text-red-600 font-semibold mt-2">Please finish registering to continue.</p>}

					{/* Support contact prompt */}
					<div className="text-sm text-gray-800">
						<p>Need Support?</p>
						<p className="text-blue-600 cursor-pointer hover:underline">contact here</p>
					</div>
				</form>
			</div>
		</div>
	);
}
