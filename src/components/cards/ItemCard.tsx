"use client";

import React from "react";

import { Item } from "@/types/RestaurantType";
import Image from "next/image";

type ItemCardProps = {
	item: Item;
	onClick?: (item: Item) => void;
	buttonLabel?: string;
};

export default function ItemCard({ item, onClick, buttonLabel = "View More" }: ItemCardProps) {
	if (!item.imageUrl) item.imageUrl = "";

	const handleClick = () => {
		if (onClick) {
			onClick(item);
		}
	};

	return (
		<div className="flex w-120 h-40 bg-white shadow-md rounded-lg overflow-hidden border border-gray-300">
			<div className="w-1/2 h-full">
				<Image src={item.imageUrl} alt={item.name} width={400} height={300} className="w-full h-full object-cover" />
			</div>

			<div className="w-1/2 p-4 flex flex-col justify-between">
				<div>
					<h2 className="text-xl font-semibold text-black">{item.name}</h2>
					<div>
						{item.dietaries.map((dietary: string, index: number) => (
							<p key={index} className="text-gray-600 inline-block mr-2 border border-black/25 rounded-sm px-2">
								{dietary}
							</p>
						))}
					</div>
					<p className="text-gray-600">${item.price.toFixed(2)}</p>
				</div>
				<button
					onClick={handleClick}
					className="mt-2 self-start bg-(--color-steel-blue) hover:bg-(--color-ice-blue) text-white hover:text-(--color-black) hover:outline px-4 py-2 rounded-md text-sm transition cursor-pointer w-full">
					{buttonLabel}
				</button>
			</div>
		</div>
	);
}
