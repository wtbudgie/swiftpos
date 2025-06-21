/**
 * File: SidebarSection.tsx
 * Description:
 * Provides the sidebar navigation component for SwiftPOS, containing category buttons
 * that allow users to switch between different application sections.
 * Author: William Anderson
 */

"use client";

import CategoryButton from "@/components/buttons/CategoryButton";

/**
 * Type: SidebarSectionProps
 *
 * Properties:
 * - onCategoryClick: (categoryId: string) => void — callback when a category is selected
 * - activeSection: string — currently active section ID for highlighting
 */
type SidebarSectionProps = {
	onCategoryClick: (categoryId: string) => void;
	activeSection: string;
};

/**
 * Type: Category
 *
 * Properties:
 * - id: string — unique identifier for the category
 * - name: string — display name for the category
 * - disabled?: boolean — optional flag to disable the category
 */
export type Category = {
	id: string;
	name: string;
	disabled?: boolean;
};

/**
 * Enum: pages
 *
 * Description:
 * Defines the available application sections with their string identifiers.
 * Used for consistent routing and state management throughout the application.
 */
export enum pages {
	"activeOrders" = "activeOrders",
	"pastOrders" = "pastOrders",
	"menuSettings" = "menuSettings",
	"storeSettings" = "storeSettings",
	"salesStatistics" = "salesStatistics",
}

/**
 * Constant: categories
 *
 * Description:
 * Array of Category objects representing all available navigation options.
 * Each category corresponds to a major application section.
 *
 * Structure:
 * - activeOrders: View current in-progress orders
 * - pastOrders: View historical order data
 * - menuSettings: Manage menu items and categories
 * - storeSettings: Configure restaurant details
 * - salesStatistics: View sales reports and analytics
 */
const categories: Category[] = [
	{
		id: pages.activeOrders,
		name: "View Active Orders",
	},
	{
		id: pages.pastOrders,
		name: "View Past Orders",
	},
	{
		id: pages.menuSettings,
		name: "Edit Menu",
	},
	{
		id: pages.storeSettings,
		name: "Edit Store",
	},
	{
		id: pages.salesStatistics,
		name: "View Sales Statistics",
	},
];

/**
 * Component: SidebarSection
 *
 * Props:
 * - onCategoryClick: function — handler for category selection events
 * - activeSection: string — identifier of currently active section
 *
 * Description:
 * Renders a vertical navigation sidebar with interactive category buttons.
 * Manages the visual state of active/inactive categories and handles
 * user interaction events.
 *
 * Features:
 * - Scrollable container for many categories
 * - Visual highlighting of active section
 * - Consistent spacing and styling
 */
export default function SidebarSection({ onCategoryClick, activeSection }: SidebarSectionProps) {
	return (
		<div className="flex flex-col items-center gap-2 overflow-y-auto max-h-[calc(100vh-220px)] ...">
			{categories.map((category) => (
				<CategoryButton
					key={category.id}
					displayName={category.name}
					onClick={() => onCategoryClick(category.id)}
					highlighted={category.id === activeSection}
				/>
			))}
		</div>
	);
}

/**
 * Testing Notes:
 * - Verify all category buttons render correctly with proper labels
 * - Test clicking each button triggers onCategoryClick with correct ID
 * - Confirm active section receives proper highlighting
 * - Test scroll behavior with many categories
 * - Verify responsive design at different screen sizes
 */
