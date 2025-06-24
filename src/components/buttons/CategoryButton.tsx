/**
 * File: CategoryButton.tsx
 * Description: Client-side React component that renders a button representing a category.
 *              It manages an active highlight state, updating based on props, and triggers a callback on click.
 * Author: William Anderson
 */

import React, { useEffect, useState } from "react";

/**
 * Interface: CategoryButtonProps
 * Defines expected props for CategoryButton component.
 *
 * @property {string} displayName - Text displayed on the button.
 * @property {() => void} onClick - Callback function invoked when button is clicked.
 * @property {boolean} highlighted - Determines if button appears active/highlighted.
 */
interface CategoryButtonProps {
	displayName: string;
	onClick: () => void;
	highlighted: boolean;
}

/**
 * Component: CategoryButton
 *
 * Purpose:
 * - Renders a styled button that reflects a category selection.
 * - Manages internal 'active' state synced to the incoming 'highlighted' prop.
 * - Calls onClick prop when user clicks the button.
 *
 * Inputs:
 * - displayName: string - label to display.
 * - onClick: function - handler for click events.
 * - highlighted: boolean - whether the button is highlighted.
 *
 * Outputs:
 * - JSX.Element: a button element with appropriate styles and behavior.
 *
 * Internal Behavior:
 * - Uses useEffect to update local 'active' state whenever 'highlighted' prop changes.
 * - Logs highlight status and displayName to console for debugging.
 *
 * Notes:
 * - Class names use CSS custom properties syntax; ensure CSS variables are correctly defined.
 * - The width is fixed at 90% of container; consider responsiveness if container width varies.
 */
export default function CategoryButton({ displayName, onClick, highlighted }: CategoryButtonProps) {
	// Local state mirrors the 'highlighted' prop for styling control.
	const [active, setActive] = useState(highlighted);

	useEffect(() => {
		setActive(highlighted);
	}, [highlighted]);

	return (
		<button
			onClick={onClick}
			className={`border-2 border-(--color-white) border-solid rounded-sm ${
				active ? "bg-(--color-steel-blue) hover:bg-(--color-steel-blue-dark)" : "bg-(--color-ice-blue) hover:bg-(--color-white)"
			} text-(--color-black) px-6 py-2 rounded-lg font-semibold transition-all duration-300 ease-in-out w-[90%] cursor-pointer`}>
			{displayName}
		</button>
	);
}

/**
 * Testing Notes:
 * - Verify button highlights correctly when 'highlighted' prop changes.
 * - Confirm onClick handler triggers when the button is clicked.
 * - Check console logs for expected debug output during prop changes.
 * - Ensure CSS variables (e.g., --color-white) are properly defined; otherwise, styles will not apply correctly.
 */
