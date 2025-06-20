"use client";

import { ReturnedRestaurant } from "@/app/restaurant/[restaurantId]/page";
import CategoryButton from "@/components/buttons/CategoryButton";
import { useEffect, useState } from "react";

type SidebarSectionProps = {
	restaurantData: ReturnedRestaurant;
	onCategoryClick: (categoryId: string) => void;
	currentCategory: string | null;
};

export default function SidebarSection({ restaurantData, onCategoryClick, currentCategory }: SidebarSectionProps) {
	const [activeCat, setActiveCat] = useState(currentCategory);

	useEffect(() => {
		setActiveCat(currentCategory);
	}, [currentCategory]);

	return (
		<div className="flex flex-col items-center gap-2 overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar w-full">
			{restaurantData?.categories.map((category) => (
				<CategoryButton
					key={category.id}
					displayName={category.name}
					onClick={() => onCategoryClick(category.id)}
					highlighted={activeCat === category.id}
				/>
			))}
		</div>
	);
}
