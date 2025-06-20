"use client";

import React, { useState } from "react";

import { User } from "next-auth";
import { useRouter } from "next/navigation";
import { logout } from "@/utils/authController";

type AccountSettingsModalProps = {
	isOpen: boolean;
	onClose: () => void;
	userData: User;
};

export default function AccountSettingsModal({ isOpen, onClose, userData }: AccountSettingsModalProps) {
	const [firstName, setFirstName] = useState(userData?.firstName ?? "");
	const [secondName, setSecondName] = useState(userData?.secondName ?? "");
	const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber ?? "");
	const [showWarning, setShowWarning] = useState(false);

	const router = useRouter();

	if (!userData) return null;

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

			userData = data.user;
			onClose(); // close modal
		} catch (error) {
			console.error("Error updating user:", error);
			setShowWarning(true);
		}
	};

	return (
		<div
			className={`fixed inset-0 z-[999] grid h-screen w-screen place-items-center
            bg-black/60
            backdrop-blur-sm
            transition-opacity duration-300
			${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
			onClick={onClose}>
			<div className="relative m-4 p-6 w-full max-w-md rounded-lg bg-(--color-white) shadow-lg text-black" onClick={(e) => e.stopPropagation()}>
				<form onSubmit={handleSubmit} className="flex flex-col gap-6 text-center">
					<h2 className="text-3xl font-bold mb-4">Edit Account Details</h2>

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

					<div>
						<label htmlFor="email" className="block font-semibold text-left text-black">
							Phone Number
						</label>
						<p className="text-xs text-gray-700 text-left mb-1">Your best contact phone number. (e.g 61-0400000000)</p>
						<input
							id="phone"
							type="text"
							value={phoneNumber}
							onChange={(e) => setPhoneNumber(e.target.value)}
							className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 text-black"
						/>
					</div>

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

					<button type="submit" className="bg-(--color-steel-blue) text-white py-2 rounded hover:bg-blue-700 transition">
						Save Details
					</button>

					<button
						type="button"
						onClick={() => {
							logout();
							router.refresh();
						}}
						className="bg-red-600 text-white py-2 rounded hover:bg-red-700 transition">
						Log Out
					</button>

					{showWarning && <p className="text-red-600 font-semibold mt-2">Please finish registering to continue.</p>}

					<div className="text-sm text-gray-800">
						<p>Need Support?</p>
						<p className="text-blue-600 cursor-pointer hover:underline">contact here</p>
					</div>
				</form>
			</div>
		</div>
	);
}
