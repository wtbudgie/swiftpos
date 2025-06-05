"use client";

import { Item } from "@/types/RestaurantType";
import React from "react";

type Props = {
	item: Item;
	onClick?: () => void;
};

export default function ItemCard({ item, onClick }: Props) {
	return (
		<div className="flex w-120 h-40 bg-white shadow-md rounded-lg overflow-hidden border border-gray-300">
			<div className="w-1/2 h-full">
				<img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
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
					onClick={onClick}
					className="mt-2 self-start bg-(--color-steel-blue) hover:bg-(--color-ice-blue) text-white hover:text-(--color-black) hover:outline px-4 py-2 rounded-md text-sm transition cursor-pointer w-full">
					View More
				</button>
			</div>
		</div>
	);
}
