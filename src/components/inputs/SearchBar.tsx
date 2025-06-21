/**
 * File: SearchBar.tsx
 * Description: React functional component rendering a controlled search input with an icon, supporting enable/disable state.
 * Author: William Anderson
 */

"use client";

import React from "react";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

type SearchBarProps = {
	value: string; // Current value of the search input (string)
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // Event handler for input changes
	disabled: boolean; // Boolean flag to enable/disable the input
};

/**
 * Component: SearchBar
 * Inputs:
 * - value: string — current text inside the search input
 * - onChange: function — callback invoked on input change, receives React.ChangeEvent<HTMLInputElement>
 * - disabled: boolean — toggles input usability and cursor style
 *
 * Output:
 * - JSX.Element rendering a styled div containing an icon, a separator, and an input field
 *
 * Description:
 * This component provides a search input box with a search icon on the left.
 * It supports disabling the input and changes the cursor style accordingly.
 * The input is controlled via the 'value' and 'onChange' props.
 */
export default function SearchBar({ value, onChange, disabled }: SearchBarProps) {
	console.log(disabled); // Logs current disabled state for debugging

	return (
		<div className="w-full h-10 flex items-center bg-gray-100 border border-gray-300 rounded-md px-4">
			<SearchOutlinedIcon className="text-black" />
			<div className="h-5 w-px bg-black mx-3" />
			<input
				type="text"
				value={value}
				onChange={onChange}
				placeholder="Search..."
				className={`bg-transparent outline-none text-gray-800 w-full placeholder-gray-500 ${disabled ? "cursor-not-allowed" : "cursor-text"}`}
				disabled={disabled}
			/>
		</div>
	);
}

/**
 * Testing Notes:
 * - Verify that typing in the input updates the value via onChange.
 * - Test that when disabled is true, input is not editable and cursor shows "not-allowed".
 * - Check rendering of the search icon and separator line.
 * - Confirm no unexpected console outputs in production (consider removing console.log).
 */
