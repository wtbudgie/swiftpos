/**
 * File: ItemModal.tsx
 * Description: Modal component for viewing and customizing menu items before adding to cart in SwiftPOS.
 * Handles item modifications, quantity selection, and special instructions.
 * Author: William Anderson
 */

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Item, ModificationGroup } from "@/types/RestaurantType";

/**
 * Type: ItemModalProps
 *
 * Props for the ItemModal component:
 * - item: Item — The menu item being viewed/edited
 * - isOpen: boolean — Controls modal visibility
 * - onClose: () => void — Callback to close the modal
 * - onAddToCart: (item, quantity, selectedMods, customText) => void — Callback when adding to cart
 * - initialSelectedMods?: SelectedMods — Preselected modifications when editing
 * - initialCustomText?: string — Preset custom instructions when editing
 * - initialQuantity?: number — Preset quantity when editing
 * - isEditing?: boolean — Flag for edit mode vs. new item mode
 */
type ItemModalProps = {
	item: Item;
	isOpen: boolean;
	onClose: () => void;
	onAddToCart: (item: Item, quantity: number, selectedMods: SelectedMods, customText: string) => void;
	initialSelectedMods?: SelectedMods;
	initialCustomText?: string;
	initialQuantity?: number;
	isEditing?: boolean;
};

/**
 * Type: SelectedMods
 *
 * Structure tracking selected modification options:
 * - Key: modification group ID
 * - Value: array of selected option IDs
 */
export type SelectedMods = {
	[groupId: string]: string[];
};

/**
 * Component: ItemModal
 *
 * Input:
 * - Props as defined in ItemModalProps
 *
 * Output:
 * - React component rendering a modal dialog
 * - Calls onAddToCart with user selections when confirmed
 *
 * Description:
 * Provides a detailed view of menu items with options to:
 * - Adjust quantity
 * - Select modification options
 * - Add special instructions
 * - View dietary information and ingredients
 * Calculates and displays the total price including modifications
 */
export default function ItemModal({
	item,
	isOpen,
	onClose,
	onAddToCart,
	initialSelectedMods = {},
	initialCustomText = "",
	isEditing,
	initialQuantity,
}: ItemModalProps) {
	// State for user selections
	const [quantity, setQuantity] = useState(1);
	const [selectedMods, setSelectedMods] = useState<SelectedMods>({});
	const [customText, setCustomText] = useState("");

	// Reset form when modal opens or initial values change
	useEffect(() => {
		if (isOpen) {
			setQuantity(initialQuantity || 1);
			setSelectedMods(initialSelectedMods);
			setCustomText(initialCustomText);
		}
	}, [isOpen, initialSelectedMods, initialCustomText, initialQuantity]);

	/**
	 * Function: toggleModOption
	 * Input:
	 * - group: ModificationGroup — The modification group being changed
	 * - optionId: string — The option ID to toggle
	 *
	 * Description:
	 * Toggles the selection state of a modification option, enforcing group rules:
	 * - Cannot exceed maxSelectable options per group
	 * - Maintains current selection if limit reached
	 */
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

	/**
	 * Function: calcTotalPrice
	 * Output:
	 * - number — Total price including base price and all modifications
	 *
	 * Description:
	 * Calculates the total price by:
	 * 1. Multiplying base price by quantity
	 * 2. Adding price modifiers from all selected options
	 * 3. Multiplying modification total by quantity
	 */
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
				{/* Left Column - Item Image */}
				<div className="w-1/2 min-w-[300px]">
					<div className="relative w-full h-full rounded-l-lg overflow-hidden">
						<Image
							src={item.imageUrl || "https://www.svgrepo.com/show/508699/landscape-placeholder.svg"}
							alt={item.name}
							fill
							className="object-cover"
							priority
						/>
					</div>
				</div>

				{/* Right Column - Item Details */}
				<div className="w-1/2 p-6 flex flex-col justify-between">
					<div>
						<h2 className="text-3xl font-bold mb-2">{item.name}</h2>
						<p className="mb-4 text-gray-700">{item.description}</p>

						{/* Dietary Tags */}
						<div className="mb-4 flex flex-wrap gap-2">
							{item.dietaries.map((d) => (
								<span key={d} className="text-xs border border-gray-400 rounded px-2 py-1 text-gray-600">
									{d}
								</span>
							))}
						</div>

						{/* Ingredients List */}
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

						{/* Quantity Selector */}
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

						{/* Modification Groups */}
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

						{/* Special Instructions */}
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
								maxLength={100}
							/>
						</div>
					</div>

					{/* Action Buttons */}
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

/**
 * Testing Notes:
 * - Verify modal opens/closes based on isOpen prop
 * - Test quantity selector with valid/invalid inputs
 * - Test modification selection with various group rules
 * - Verify price calculation includes all modifications
 * - Test dietary tags display correctly
 * - Verify ingredients list formatting
 * - Test special instructions textarea behavior
 * - Check image fallback when no imageUrl provided
 * - Verify edit mode vs. add mode button labels
 * - Test all callback functions with expected data
 */
