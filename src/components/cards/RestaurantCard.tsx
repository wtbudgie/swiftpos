/**
 * File: RestaurantCard.tsx
 * Description: React component displaying a restaurant's summary card with image, description, address, and link to order page.
 * Author: William Anderson
 */

"use client";

import Link from "next/link";
import Image from "next/image";

type RestaurantCardProps = {
	id: string; // Unique identifier for the restaurant (string)
	name: string; // Name of the restaurant (string)
	description: string; // Short description of the restaurant (string)
	address: string; // Physical address of the restaurant (string)
	imageUrl: string; // URL of the restaurant's image (string)
};

/**
 * Component: RestaurantCard
 * Inputs:
 * - id: string — restaurant's unique ID for URL routing
 * - name: string — restaurant name to display
 * - description: string — brief text about the restaurant
 * - address: string — physical location string
 * - imageUrl: string — image source URL
 *
 * Outputs:
 * - JSX.Element rendering a card with image, text info, and an order link
 *
 * Description:
 * Displays a restaurant card with its image, name, description, address,
 * and a call-to-action button linking to the restaurant's ordering page.
 * Utilizes Next.js Image for optimized image rendering and Link for client-side routing.
 */
export default function RestaurantCard({ id, name, description, address, imageUrl }: RestaurantCardProps) {
	return (
		<div className="bg-(--color-gray) shadow-lg rounded-lg overflow-hidden">
			{/* Restaurant image with fixed dimensions for consistent layout */}
			<Image src={imageUrl} alt={name} width={0} height={0} className="w-full h-40 object-cover" />

			<div className="p-4 text-left">
				{/* Restaurant name as heading */}
				<h2 className="text-xl font-bold mb-1">{name}</h2>
				{/* Description with smaller text */}
				<p className="text-sm text-(--color-white) mb-2">{description}</p>
				{/* Address styled as italic and smaller text */}
				<p className="text-xs text-(--color-ice-blue) italic mb-4">{address}</p>
				<div className="flex justify-center">
					{/* Link to the restaurant's order page */}
					<Link
						href={`/restaurant/${id}`}
						className="bg-(--color-ice-blue) text-(--color-black) px-6 py-2 rounded hover:bg-(--color-steel-blue) transition text-center w-full block">
						Order Now
					</Link>
				</div>
			</div>
		</div>
	);
}
