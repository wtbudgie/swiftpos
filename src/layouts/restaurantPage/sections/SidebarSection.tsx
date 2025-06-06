"use client";
import CategoryButton from "@/components/buttons/CategoryButton";
import { ReturnedRestaurant } from "@/app/restaurant/[restaurantId]/page";

type SidebarSectionProps = {
	restaurantData: ReturnedRestaurant;
	onCategoryClick: (categoryId: string) => void;
};

export default function SidebarSection({ restaurantData, onCategoryClick }: SidebarSectionProps) {
	return (
		<div className="flex flex-col items-center gap-2 overflow-y-auto max-h-[calc(100vh-220px)] ...">
			{restaurantData?.categories.map((category) => (
				<CategoryButton key={category.id} displayName={category.name} onClick={() => onCategoryClick(category.id)} highlighted={false} />
			))}
		</div>
	);
}
