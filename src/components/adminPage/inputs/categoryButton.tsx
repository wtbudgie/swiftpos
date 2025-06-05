"use client";

import React from "react";

interface categoryButtonProps {
	displayName: string;
	onClick: () => void;
}

export default function CategoryButton({ displayName, onClick }: categoryButtonProps) {
	return (
		<button
			onClick={onClick}
			className="border-2 border-(--color-white) border-solid rounded-sm bg-(--color-ice-blue) text-(--color-black) px-6 py-2 rounded-lg font-semibold hover:bg-(--color-white) hover:rounded-lg transition-all duration-300 ease-in-out w-[90%] cursor-pointer">
			{displayName}
		</button>
	);
}
