/**
 * File: ItemCard.tsx
 * Description: React component to display a restaurant menu item with image, dietary info, price, and a customizable action button.
 * Author: William Anderson
 */

"use client";

import React from "react";
import { Item } from "@/types/RestaurantType";
import Image from "next/image";

type ItemCardProps = {
	/**
	 * Input: item (Item)
	 * - The menu item data to display, including name, price, dietary tags, and image URL.
	 */
	item: Item;

	/**
	 * Input: onClick (optional function)
	 * - Callback triggered when the button is clicked. Receives the Item object.
	 */
	onClick?: (item: Item) => void;

	/**
	 * Input: buttonLabel (optional string)
	 * - Text displayed on the button. Defaults to "View More".
	 */
	buttonLabel?: string;
};

/**
 * Component: ItemCard
 *
 * Purpose:
 * Displays a card with the item's image, name, dietary tags, price, and an action button.
 *
 * Inputs:
 * - item: Item (object) containing properties such as name (string), price (number), dietaries (string[]), imageUrl (string).
 * - onClick: optional function, called with item when button is clicked.
 * - buttonLabel: optional string for button text, defaults to "View More".
 *
 * Outputs:
 * - JSX element rendering the item card UI.
 *
 * Behavior:
 * - If item.imageUrl is falsy, sets it to empty string to prevent errors in <Image>.
 * - Handles button click by calling onClick callback if provided.
 */
export default function ItemCard({ item, onClick, buttonLabel = "View More" }: ItemCardProps) {
	// Defensive assignment to avoid undefined image URL errors in Image component
	if (!item.imageUrl) item.imageUrl = "";

	// Handle button click event
	const handleClick = () => {
		if (onClick) {
			onClick(item);
		}
	};

	return (
		<div className="flex flex-col sm:flex-row w-full h-auto bg-white shadow-md rounded-lg overflow-hidden border border-gray-300">
			{/* Image container: responsive width and height */}
			<div className="sm:w-1/2 w-full h-40 sm:h-auto">
				<Image src={item.imageUrl} alt={item.name} width={400} height={300} className="w-full h-full object-cover" />
			</div>

			{/* Textual details and button */}
			<div className="sm:w-1/2 w-full p-4 flex flex-col justify-between">
				<div>
					{/* Item name */}
					<h2 className="text-xl font-semibold text-black">{item.name}</h2>

					{/* Dietary tags */}
					<div className="flex flex-wrap gap-1 my-1">
						{item.dietaries.map((dietary, index) => (
							<span key={index} className="text-gray-600 text-sm border border-black/25 rounded-sm px-2">
								{dietary}
							</span>
						))}
					</div>

					{/* Price formatted to 2 decimal places */}
					<p className="text-gray-600">${item.price.toFixed(2)}</p>
				</div>

				{/* Action button with customizable label */}
				<button
					onClick={handleClick}
					className="mt-2 bg-(--color-steel-blue) hover:bg-(--color-ice-blue) text-white hover:text-(--color-black) hover:outline px-4 py-2 rounded-md text-sm transition w-full">
					{buttonLabel}
				</button>
			</div>
		</div>
	);
}

/**
 * Testing Notes:
 * - Verify the component renders correctly with valid and missing imageUrl.
 * - Test onClick callback triggers with the correct item.
 * - Check buttonLabel text changes when passed as a prop.
 * - Confirm dietary tags render as expected.
 */
