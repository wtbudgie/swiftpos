"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

type RestaurantAccessModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

export default function RestaurantAccessModal({ isOpen, onClose }: RestaurantAccessModalProps) {
	const [restaurantId, setRestaurantId] = useState("");
	const [showWarning, setShowWarning] = useState(false);
	const router = useRouter();

	const handleBackdropClick = () => {
		onClose();
	};

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
            bg-black/60
            backdrop-blur-sm
            transition-opacity duration-300
			${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
			onClick={handleBackdropClick}>
			<div onClick={(e) => e.stopPropagation()} className="w-full max-w-md mx-4 bg-white text-black p-6 rounded-lg shadow-lg">
				<h2 className="text-3xl font-bold mb-4 text-center">Restaurant Access</h2>
				<div className="flex flex-col gap-4">
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

					{showWarning && <p className="text-red-600 font-semibold mt-2 text-center">Please enter a restaurant ID to continue.</p>}

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
