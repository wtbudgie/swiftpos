"use client";

import React from "react";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

type SearchBarProps = {
	value: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	disabled: boolean;
};

export default function SearchBar({ value, onChange, disabled }: SearchBarProps) {
	console.log(disabled);
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
