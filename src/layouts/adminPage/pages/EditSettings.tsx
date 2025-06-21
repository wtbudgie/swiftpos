/**
 * File: EditStorePage.tsx
 * Description: Restaurant profile management page for SwiftPOS.
 * Handles editing of restaurant details including name, contact info, dietary options, and image.
 * Author: William Anderson
 * Created: 2025-06-21
 */

"use client";

import { SanitizedRestaurant } from "@/app/restaurant/[restaurantId]/admin/page";
import { User } from "@/types/UserType";
import Image from "next/image";
import { useState } from "react";

/**
 * Type: EditStorePageProps
 *
 * Component props:
 * - restaurantData: SanitizedRestaurant — Contains current restaurant details
 */
type EditStorePageProps = {
	restaurantData: SanitizedRestaurant;
};

/**
 * Component: EditStorePage
 *
 * Input:
 * - Props as defined in EditStorePageProps
 *
 * Output:
 * - React component rendering restaurant profile form
 *
 * Description:
 * Provides comprehensive restaurant profile management with:
 * - Image upload functionality
 * - Contact information editing
 * - Dietary options management
 * - Form validation and submission
 * - Responsive layout
 */
export default function EditStorePage({ restaurantData }: EditStorePageProps) {
	const restaurantId = restaurantData._id;
	const [showWarning, setShowWarning] = useState(false);

	// Form state management
	const [storeName, setStoreName] = useState(restaurantData.name);
	const [storeAddress, setStoreAddress] = useState(restaurantData.address);
	const [storeImage, setStoreImage] = useState(restaurantData.imageUrl);
	const [storeDescription, setStoreDescription] = useState(restaurantData.description);
	const [storeContactEmail, setStoreContactEmail] = useState(restaurantData.contactEmail);
	const [storeContactNumber, setStoreContactNumber] = useState(restaurantData.contactEmail);
	const [storeDietaries, setStoreDietaries] = useState(restaurantData.dietaries);
	const [newDietary, setNewDietary] = useState("");

	/**
	 * Handler: handleSubmit
	 * Input:
	 * - e: React.FormEvent — Form submission event
	 *
	 * Description:
	 * Handles form submission by:
	 * 1. Preventing default form behavior
	 * 2. Sending updated restaurant data to API
	 * 3. Handling success/error responses
	 */
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			const response = await fetch(`/api/restaurant/${restaurantId}/config/save`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: storeName,
					address: storeAddress,
					imageUrl: storeImage,
					description: storeDescription,
					contactEmail: storeContactEmail,
					phoneNumber: storeContactNumber,
					dietaries: storeDietaries,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				console.error("Update failed:", data.message);
				setShowWarning(true);
				return;
			}
		} catch (error) {
			console.error("Error updating user:", error);
			setShowWarning(true);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="max-w-5xl w-full mx-auto flex flex-col gap-6 px-6 py-8 text-center">
			<h2 className="text-3xl font-bold mb-4">Edit Account Details</h2>

			{/* Image Upload Section */}
			<div className="text-left">
				<label className="block text-sm font-medium mb-1">Upload Restaurant Icon</label>
				<input
					type="file"
					accept="image/*"
					onChange={async (e) => {
						const file = e.target.files?.[0];
						if (file) {
							try {
								const url = await uploadImage(file, restaurantId);
								setStoreImage(url);
							} catch (err) {
								console.error("Upload failed", err);
								alert("Failed to upload image.");
							}
						}
					}}
					className="w-full border px-3 py-2 rounded bg-white"
				/>
				{storeImage && (
					<div className="mt-4 rounded overflow-hidden w-full max-w-md mx-auto">
						<Image src={storeImage} alt="Preview" width={500} height={160} className="w-full h-40 object-cover rounded" />
					</div>
				)}
			</div>

			{/* Name and ID Section */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="flex-1">
					<label htmlFor="name" className="block font-semibold text-left text-black">
						Restaurant Name
					</label>
					<p className="text-xs text-gray-700 text-left mb-1">The display name for the restaurant.</p>
					<input
						id="name"
						maxLength={30}
						type="text"
						value={storeName}
						onChange={(e) => setStoreName(e.target.value)}
						className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 text-black"
					/>
				</div>

				<div className="flex-1">
					<label htmlFor="restaurantId" className="block font-semibold text-left text-black">
						Restaurant ID
					</label>
					<p className="text-xs text-gray-700 text-left mb-1">The restaurant's ID (support use only).</p>
					<input
						id="restaurantId"
						type="text"
						value={restaurantData._id}
						disabled
						className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 cursor-not-allowed text-black"
					/>
				</div>
			</div>

			{/* Contact Information Section */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="flex-1">
					<label htmlFor="email" className="block font-semibold text-left text-black">
						Restaurant Email
					</label>
					<p className="text-xs text-gray-700 text-left mb-1">Please enter the preferred email address.</p>
					<input
						id="email"
						type="email"
						value={storeContactEmail}
						onChange={(e) => setStoreContactEmail(e.target.value)}
						className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 text-black"
						required
						maxLength={30}
					/>
				</div>

				<div className="flex-1">
					<label htmlFor="phone" className="block font-semibold text-left text-black">
						Restaurant Phone Number
					</label>
					<p className="text-xs text-gray-700 text-left mb-1">Please enter the preferred contact number.</p>
					<input
						id="phone"
						type="text"
						value={storeContactNumber}
						onChange={(e) => setStoreContactNumber(e.target.value)}
						className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 text-black"
						required
						maxLength={11}
					/>
				</div>
			</div>

			{/* Dietary Options Section */}
			<div className="text-left">
				<label className="block text-sm font-medium mb-1">Manage Dietary Options</label>
				<p className="text-xs text-gray-700 mb-2">Add or remove dietary labels like Vegan, Halal, etc.</p>
				<div className="flex gap-2 mb-2">
					<input
						type="text"
						placeholder="Add new dietary..."
						className="flex-1 border rounded px-3 py-1"
						value={newDietary}
						onChange={(e) => setNewDietary(e.target.value)}
					/>
					<button
						type="button"
						className="bg-(--color-steel-blue) text-black px-3 rounded hover:bg-(--color-ice-blue) hover:text-black cursor-pointer transition"
						onClick={() => {
							const trimmed = newDietary.trim();
							if (trimmed && !storeDietaries.includes(trimmed)) {
								setStoreDietaries([...storeDietaries, trimmed]);
								setNewDietary("");
							}
						}}>
						Add
					</button>
				</div>
				<div className="flex flex-wrap gap-2">
					{storeDietaries.map((option) => (
						<span key={option} className="text-sm bg-gray-200 px-2 py-1 rounded flex items-center gap-1">
							{option}
							<button
								type="button"
								className="text-red-600 hover:text-red-800"
								onClick={() => setStoreDietaries(storeDietaries.filter((d) => d !== option))}>
								×
							</button>
						</span>
					))}
				</div>
			</div>

			{/* Submit Button */}
			<button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
				Save Details
			</button>

			{/* Support Link */}
			<div className="text-sm text-gray-800">
				<p>Need Support?</p>
				<p className="text-blue-600 cursor-pointer hover:underline">contact here</p>
			</div>
		</form>
	);
}

/**
 * Function: uploadImage
 * Input:
 * - file: File — The image file to upload
 * - restaurantId: string — ID of the restaurant
 *
 * Output:
 * - Promise<string> — Resolves to the uploaded image URL
 *
 * Description:
 * Handles image upload to server via API endpoint
 * Throws error if upload fails
 */
async function uploadImage(file: File, restaurantId: string): Promise<string> {
	const formData = new FormData();
	formData.append("file", file);

	const res = await fetch(`/api/restaurant/${restaurantId}/upload`, {
		method: "POST",
		body: formData,
	});

	if (!res.ok) {
		throw new Error("Image upload failed");
	}

	const data = await res.json();
	return data.url;
}

/**
 * Testing Notes:
 * - Verify form submission with valid/invalid data
 * - Test image upload functionality
 * - Check dietary options management (add/remove)
 * - Verify field validation (email format, length limits)
 * - Test responsive layout at different screen sizes
 * - Check disabled ID field behavior
 * - Verify error handling for failed submissions
 * - Test image preview functionality
 * - Check support link behavior
 */
