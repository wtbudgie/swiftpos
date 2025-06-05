"use client";

import React from "react";

interface CategoryButtonProps {
	displayName: string;
	onClick: () => void;
	highlighted: boolean;
}

export default function CategoryButton({ displayName, onClick, highlighted }: CategoryButtonProps) {
	return (
		<button
			onClick={onClick}
			className={`border-2 border-(--color-white) border-solid rounded-sm ${
				highlighted ? "bg-(--color-steel-blue)" : "bg-(--color-ice-blue)"
			} text-(--color-black) px-6 py-2 rounded-lg font-semibold hover:bg-(--color-white) hover:rounded-lg transition-all duration-300 ease-in-out w-[90%] cursor-pointer`}>
			{displayName}
		</button>
	);
}
