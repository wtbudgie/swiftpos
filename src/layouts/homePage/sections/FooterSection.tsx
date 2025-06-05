"use client";

import { useState } from "react";
import RestaurantAccessModal from "@/components/modals/RestaurantAccessModal";

export default function FooterSectionModal() {
	const [isRestaurantAccessOpen, setRestaurantAccessOpen] = useState(false);

	return (
		<div className="fixed bottom-0 left-0 w-full bg-(--color-black) shadow-md px-6 py-4">
			<div className="flex flex-col items-center justify-center text-center space-y-2">
				<div className="flex items-center gap-4">
					<span className="text-sm color-white whitespace-nowrap">Want to add your restaurant?</span>
					<button
						className="bg-(--color-steel-blue) hover:bg-(--color-ice-blue) color-white hover:text-(--color-black) px-4 py-2 rounded-md transition cursor-pointer"
						onClick={() => alert("Contact form coming soon!")}>
						Get in contact
					</button>

					<div className="h-6 w-px bg-gray-300 mx-4" />

					<RestaurantAccessModal
						isOpen={isRestaurantAccessOpen}
						onClose={() => {
							setRestaurantAccessOpen(false);
						}}
					/>
					<button
						className="bg-(--color-steel-blue) hover:bg-(--color-ice-blue) color-white hover:text-(--color-black) px-4 py-2 rounded-md transition cursor-pointer"
						onClick={() => setRestaurantAccessOpen(true)}>
						Restaurant Access
					</button>
				</div>

				<div className="w-1/3 border-t border-(--color-white) my-2" />

				<div className="flex gap-6 text-sm text-(--color-ice-blue) font-bold cursor-pointer">
					<a href="#" className="hover:underline">
						Privacy Policy
					</a>
					<a href="#" className="hover:underline">
						Terms of Service
					</a>
					<a href="#" className="hover:underline">
						Contact Support
					</a>
				</div>
			</div>
		</div>
	);
}
