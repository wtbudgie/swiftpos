"use client";

import React, { useState, useEffect } from "react";
import { Item, ModificationGroup, ModificationOption } from "@/types/RestaurantType";

type Props = {
	item: Item;
	isOpen: boolean;
	onClose: () => void;
	onAddToCart: (item: Item, quantity: number, selectedMods: SelectedMods, customText: string) => void;
	initialSelectedMods?: SelectedMods;
	initialCustomText?: string;
	initialQuantity?: number;
	isEditing?: boolean;
};

export type SelectedMods = {
	[groupId: string]: string[];
};

export default function ItemModal({ item, isOpen, onClose, onAddToCart, initialSelectedMods = {}, initialCustomText = "", isEditing, initialQuantity }: Props) {
	const [quantity, setQuantity] = useState(1);
	const [selectedMods, setSelectedMods] = useState<SelectedMods>({});
	const [customText, setCustomText] = useState("");

	useEffect(() => {
		if (isOpen) {
			setQuantity(initialQuantity || 1);
			setSelectedMods(initialSelectedMods);
			setCustomText(initialCustomText);
		}
	}, [isOpen, initialSelectedMods, initialCustomText, initialQuantity]);

	const toggleModOption = (group: ModificationGroup, optionId: string) => {
		const current = selectedMods[group.id] || [];
		const selected = current.includes(optionId);
		let updated: string[];

		if (selected) {
			updated = current.filter((id) => id !== optionId);
		} else {
			if (group.maxSelectable && current.length >= group.maxSelectable) return;
			updated = [...current, optionId];
		}

		setSelectedMods((prev) => ({ ...prev, [group.id]: updated }));
	};

	const calcTotalPrice = () => {
		const base = item.price * quantity;
		const mods =
			item.modifications?.reduce((sum, group) => {
				const selected = selectedMods[group.id] || [];
				return (
					sum +
					selected.reduce((modSum, id) => {
						const opt = group.options.find((o) => o.id === id);
						return opt ? modSum + opt.priceModifier : modSum;
					}, 0)
				);
			}, 0) || 0;
		return base + mods * quantity;
	};

	return (
		<div
			className={`fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
				isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
			}`}>
			<div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto flex" onClick={(e) => e.stopPropagation()}>
				{/* Left image */}
				<div className="w-1/2 min-w-[300px]">
					<img
						src={item.imageUrl || "https://www.svgrepo.com/show/508699/landscape-placeholder.svg"}
						alt={item.name}
						className="w-full h-full object-cover rounded-l-lg"
					/>
				</div>

				{/* Right side */}
				<div className="w-1/2 p-6 flex flex-col justify-between">
					<div>
						<h2 className="text-3xl font-bold mb-2">{item.name}</h2>
						<p className="mb-4 text-gray-700">{item.description}</p>

						<div className="mb-4 flex flex-wrap gap-2">
							{item.dietaries.map((d) => (
								<span key={d} className="text-xs border border-gray-400 rounded px-2 py-1 text-gray-600">
									{d}
								</span>
							))}
						</div>

						{/* Ingredients */}
						{item.ingredients?.length > 0 && (
							<div className="mb-4">
								<h4 className="font-semibold text-(--color-black) mb-1">Ingredients</h4>
								<ul className="list-disc list-inside text-sm text-(--color-black)">
									{item.ingredients.map((ing) => (
										<li key={ing.id}>
											{ing.quantity ? `${ing.quantity} ` : ""}
											{ing.name}
										</li>
									))}
								</ul>
							</div>
						)}

						{/* Quantity */}
						<div className="mb-4 flex items-center gap-4">
							<label htmlFor="quantity" className="font-semibold">
								Quantity:
							</label>
							<input
								type="number"
								id="quantity"
								min={1}
								value={quantity}
								onChange={(e) => {
									const val = parseInt(e.target.value);
									if (!isNaN(val) && val > 0) setQuantity(val);
								}}
								className="w-20 border rounded px-2 py-1"
							/>
						</div>

						{/* Mods */}
						{item.modifications && (
							<div className="mb-4">
								<h3 className="font-semibold mb-2">Modifications</h3>
								{item.modifications.map((group) => (
									<div key={group.id} className="mb-3">
										<p className="font-medium">{group.name}</p>
										<div className="flex flex-wrap gap-3 mt-1">
											{group.options.map((opt) => {
												const selected = selectedMods[group.id]?.includes(opt.id);
												return (
													<button
														key={opt.id}
														onClick={() => toggleModOption(group, opt.id)}
														className={`border rounded px-3 py-1 text-sm ${
															selected ? "bg-(--color-steel-blue) text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
														}`}>
														{opt.name}
														{opt.priceModifier !== 0 &&
															` ${opt.priceModifier > 0 ? "+" : "-"}$${Math.abs(opt.priceModifier).toFixed(2)}`}
													</button>
												);
											})}
										</div>
										{group.maxSelectable && <p className="text-xs text-gray-500 mt-1">Max selectable: {group.maxSelectable}</p>}
									</div>
								))}
							</div>
						)}

						{/* Custom Instructions */}
						<div className="mb-4">
							<label htmlFor="customText" className="font-semibold block mb-1">
								Additional Instructions
							</label>
							<textarea
								id="customText"
								value={customText}
								onChange={(e) => setCustomText(e.target.value)}
								className="w-full border rounded px-3 py-2 resize-y"
								rows={3}
								placeholder="Add any special requests or instructions here"
							/>
						</div>
					</div>

					{/* Buttons */}
					<div className="flex items-center justify-between">
						<span className="text-xl font-bold">${calcTotalPrice().toFixed(2)}</span>
						<div className="flex gap-3">
							<button onClick={onClose} className="px-4 py-2 rounded border border-gray-400 hover:bg-red-500 transition">
								Cancel
							</button>
							<button
								onClick={() => onAddToCart(item, quantity, selectedMods, customText)}
								className="px-4 py-2 bg-(--color-steel-blue) text-white rounded hover:bg-(--color-black) transition">
								{isEditing ? "Save" : "Add to Cart"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
