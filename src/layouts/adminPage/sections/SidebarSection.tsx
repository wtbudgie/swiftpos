"use client";

import CategoryButton from "@/components/buttons/CategoryButton";

type SidebarSectionProps = {
	onCategoryClick: (categoryId: string) => void;
	activeSection: string;
};

export type Category = {
	id: string;
	name: string;
	disabled?: boolean;
};

export enum pages {
	"activeOrders" = "activeOrders",
	"pastOrders" = "pastOrders",
	"menuSettings" = "menuSettings",
	"storeSettings" = "storeSettings",
	"salesStatistics" = "salesStatistics",
}

const categories: Category[] = [
	{
		id: pages.activeOrders,
		name: "View Active Orders",
	},
	{
		id: pages.pastOrders,
		name: "View Past Orders",
	},
	{
		id: pages.menuSettings,
		name: "Edit Menu",
	},
	{
		id: pages.storeSettings,
		name: "Edit Store",
	},
	{
		id: pages.salesStatistics,
		name: "View Sales Statistics",
	},
];

export default function SidebarSection({ onCategoryClick, activeSection }: SidebarSectionProps) {
	return (
		<div className="flex flex-col items-center gap-2 overflow-y-auto max-h-[calc(100vh-220px)] ...">
			{categories.map((category) => (
				<CategoryButton
					key={category.id}
					displayName={category.name}
					onClick={() => onCategoryClick(category.id)}
					highlighted={category.id === activeSection}
				/>
			))}
		</div>
	);
}
