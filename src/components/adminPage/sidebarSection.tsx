"use client";
import CategoryButton from "./inputs/categoryButton";
import { returnedRestaurant } from "@/app/restaurant/[restaurantId]/admin/page";

type SidebarSectionProps = {
	onCategoryClick: (categoryId: string) => void;
};

export type Category = {
	id: string;
	name: string;
	disabled?: boolean;
};

const categories: Category[] = [
	{
		id: "activeOrders",
		name: "View Active Orders",
	},
	{
		id: "pastOrders",
		name: "View Past Orders",
	},
	{
		id: "menuSettings",
		name: "Edit Menu",
	},
	{
		id: "storeSettings",
		name: "Edit Store",
	},
	{
		id: "salesStatistics",
		name: "View Sales Statistics",
	},
];

export default function SidebarSection({ onCategoryClick }: SidebarSectionProps) {
	return (
		<div className="flex flex-col items-center gap-2 overflow-y-auto max-h-[calc(100vh-220px)] ...">
			{categories.map((category) => (
				<CategoryButton key={category.id} displayName={category.name} onClick={() => onCategoryClick(category.id)} />
			))}
		</div>
	);
}
