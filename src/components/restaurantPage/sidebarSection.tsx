"use client";
import CategoryButton from "./inputs/categoryButton";
import { returnedRestaurant } from "@/app/restaurant/[restaurantId]/page";

type SidebarSectionProps = {
	restaurantData: returnedRestaurant;
	onCategoryClick: (categoryId: string) => void;
};

export default function SidebarSection({ restaurantData, onCategoryClick }: SidebarSectionProps) {
	return (
		<div className="flex flex-col items-center gap-2 overflow-y-auto max-h-[calc(100vh-220px)] ...">
			{restaurantData?.categories.map((category) => (
				<CategoryButton key={category.id} displayName={category.name} onClick={() => onCategoryClick(category.id)} />
			))}
		</div>
	);
}
