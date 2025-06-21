/**
 * File: SidebarSection.tsx
 *
 * Description:
 * Sidebar navigation component for SwiftPOS that displays and manages
 * restaurant menu categories. Provides interactive category selection
 * with visual feedback for the currently active category.
 *
 * Author: William Anderson
 */

"use client";

import { ReturnedRestaurant } from "@/app/restaurant/[restaurantId]/page";
import CategoryButton from "@/components/buttons/CategoryButton";
import { useEffect, useState } from "react";

/**
 * Type: SidebarSectionProps
 *
 * Properties:
 * - restaurantData: ReturnedRestaurant — Contains restaurant details including categories
 * - onCategoryClick: (categoryId: string) => void — Handler for category selection
 * - currentCategory: string | null — Currently selected category ID
 */
type SidebarSectionProps = {
	restaurantData: ReturnedRestaurant;
	onCategoryClick: (categoryId: string) => void;
	currentCategory: string | null;
};

/**
 * Component: SidebarSection
 *
 * Props:
 * - restaurantData: ReturnedRestaurant
 * - onCategoryClick: function
 * - currentCategory: string | null
 *
 * Description:
 * Renders a scrollable vertical list of restaurant menu categories as interactive buttons.
 * Maintains and synchronizes the active category state with parent component.
 *
 * Features:
 * - Dynamic category rendering from restaurant data
 * - Visual highlighting of active category
 * - Scrollable container for large category lists
 * - Responsive design
 */
export default function SidebarSection({ restaurantData, onCategoryClick, currentCategory }: SidebarSectionProps) {
	// Local state for active category with sync to props
	const [activeCat, setActiveCat] = useState(currentCategory);

	/**
	 * Effect: Sync local active category with prop changes
	 *
	 * Description:
	 * Ensures the active category highlight stays in sync when the
	 * currentCategory prop changes from parent component.
	 */
	useEffect(() => {
		setActiveCat(currentCategory);
	}, [currentCategory]);

	return (
		<div className="flex flex-col items-center gap-2 overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar w-full">
			{/* Render category buttons from restaurant data */}
			{restaurantData?.categories.map((category) => (
				<CategoryButton
					key={category.id}
					displayName={category.name}
					onClick={() => {
						onCategoryClick(category.id);
						setActiveCat(category.id);
					}}
					highlighted={activeCat === category.id}
				/>
			))}
		</div>
	);
}

/**
 * Testing Notes:
 * - Verify all categories render correctly from restaurant data
 * - Test category selection updates active state
 * - Check scroll behavior with many categories
 * - Validate active category highlighting
 * - Test responsiveness at different screen sizes
 * - Confirm proper sync between prop and local state changes
 */
