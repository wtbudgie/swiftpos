"use client";

import React, { useEffect, useState } from "react";

interface CategoryButtonProps {
	displayName: string;
	onClick: () => void;
	highlighted: boolean;
}

export default function CategoryButton({ displayName, onClick, highlighted }: CategoryButtonProps) {
	const [active, setActive] = useState(highlighted);

	useEffect(() => {
		setActive(highlighted);
		console.log(highlighted, displayName);
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
