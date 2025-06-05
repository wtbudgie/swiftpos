"use client";

import React from "react";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

export default function SearchBar() {
	return (
		<div className="w-full h-10 flex items-center bg-gray-100 border border-gray-300 rounded-md px-4">
			<SearchOutlinedIcon className="text-black" />
			<div className="h-5 w-px bg-black mx-3" />
			<input
				type="text"
				placeholder="Search..."
				className="bg-transparent outline-none text-gray-800 w-full placeholder-gray-500"
			/>
		</div>
	);
}
