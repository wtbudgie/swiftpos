"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

import { Item, Ingredient, ModificationGroup, ModificationOption } from "@/types/RestaurantType";

type EditItemModalProps = {
	isOpen: boolean;
	onClose: () => void;
	item: Item;
	onSave: (updatedItem: Item) => void;
	onDelete: (itemId: string) => void;
	restaurantDietaries: string[];
};

export default function EditItemModal({ isOpen, onClose, item, onSave, onDelete, restaurantDietaries }: EditItemModalProps) {
	const [formState, setFormState] = useState<Item>(item);
	const [imagePreview, setImagePreview] = useState<string | null>(item.imageUrl || null);

	useEffect(() => {
		setFormState(item);
	}, [item]);

	// ----- Handlers -----

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormState((prev) => ({
			...prev,
			[name]: name === "price" ? parseFloat(value) : value,
		}));
	};

	const handleDietaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setFormState((prev) => {
			const isSelected = prev.dietaries.includes(value);
			return {
				...prev,
				dietaries: isSelected ? prev.dietaries.filter((item) => item !== value) : [...prev.dietaries, value],
			};
		});
	};

	const handleSave = () => {
		onSave(formState);
		onClose();
	};

	const handleBackdropClick = () => {
		//onClose();
	};

	// ----- Ingredients -----

	const addIngredient = () => {
		setFormState((prev) => ({
			...prev,
			ingredients: [...prev.ingredients, { id: crypto.randomUUID(), name: "", quantity: "" }],
		}));
	};

	const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
		const updated = [...formState.ingredients];
		updated[index][field] = value;
		setFormState((prev) => ({ ...prev, ingredients: updated }));
	};

	const removeIngredient = (index: number) => {
		const updated = [...formState.ingredients];
		updated.splice(index, 1);
		setFormState((prev) => ({ ...prev, ingredients: updated }));
	};

	// ----- Modifications -----

	const addModificationGroup = () => {
		const newGroup: ModificationGroup = {
			id: crypto.randomUUID(),
			name: "",
			options: [],
			required: false,
			maxSelectable: undefined,
		};
		setFormState((prev) => ({
			...prev,
			modifications: [...(prev.modifications || []), newGroup],
		}));
	};

	const updateModificationGroup = <K extends keyof ModificationGroup>(index: number, field: K, value: ModificationGroup[K]) => {
		const updated = [...(formState.modifications || [])];
		updated[index][field] = value;
		setFormState((prev) => ({ ...prev, modifications: updated }));
	};

	const removeModificationGroup = (index: number) => {
		const updated = [...(formState.modifications || [])];
		updated.splice(index, 1);
		setFormState((prev) => ({ ...prev, modifications: updated }));
	};

	const addModificationOption = (groupIndex: number) => {
		const group = formState.modifications?.[groupIndex];
		if (!group) return;
		const newOption: ModificationOption = {
			id: crypto.randomUUID(),
			name: "",
			priceModifier: 0,
		};
		const updatedGroups = [...formState.modifications!];
		updatedGroups[groupIndex].options.push(newOption);
		setFormState((prev) => ({ ...prev, modifications: updatedGroups }));
	};

	const updateModificationOption = <K extends keyof ModificationOption>(groupIndex: number, optionIndex: number, field: K, value: ModificationOption[K]) => {
		if (field === "priceModifier" && typeof value === "number" && isNaN(value)) {
			value = 0 as ModificationOption[K]; // default fallback
		}
		const updatedGroups = [...(formState.modifications || [])];
		updatedGroups[groupIndex].options[optionIndex][field] = value;
		setFormState((prev) => ({ ...prev, modifications: updatedGroups }));
	};

	const removeModificationOption = (groupIndex: number, optionIndex: number) => {
		const updatedGroups = [...formState.modifications!];
		updatedGroups[groupIndex].options.splice(optionIndex, 1);
		setFormState((prev) => ({ ...prev, modifications: updatedGroups }));
	};

	useEffect(() => {
		setFormState(item);
		setImagePreview(item.imageUrl || null);
	}, [item]);

	// ----- UI -----

	return (
		<div
			className={`fixed inset-0 z-[999] flex items-center justify-center
			bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out
			${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
			onClick={handleBackdropClick}>
			<div
				onClick={(e) => e.stopPropagation()}
				className="bg-white text-black w-full max-w-2xl mx-4 p-6 rounded-lg shadow-lg relative overflow-y-auto max-h-[90vh]">
				<h2 className="text-2xl font-bold mb-4 text-center">Edit Item</h2>

				{/* Image Upload */}
				<div className="mb-4">
					<label className="block text-sm font-medium mb-1">Upload Image</label>
					<input
						type="file"
						accept="image/*"
						onChange={async (e) => {
							const file = e.target.files?.[0];
							if (file) {
								try {
									const url = await uploadImage(file);
									setFormState((prev) => ({ ...prev, imageUrl: url }));
									setImagePreview(url);
								} catch (err) {
									console.error("Upload failed", err);
									alert("Failed to upload image.");
								}
							}
						}}
						className="w-full border px-3 py-2 rounded"
					/>
					{imagePreview && (
						<div className="relative w-full h-40 mt-2 rounded overflow-hidden">
							<Image src={imagePreview} alt="Preview" fill className="object-cover rounded" />
						</div>
					)}
				</div>

				{/* Name */}
				<div className="mb-4">
					<label className="block text-sm font-medium mb-1">Name</label>
					<input type="text" name="name" value={formState.name} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
				</div>

				{/* Description */}
				<div className="mb-4">
					<label className="block text-sm font-medium mb-1">Description</label>
					<textarea
						name="description"
						value={formState.description || ""}
						onChange={handleChange}
						className="w-full border px-3 py-2 rounded"
						rows={3}
					/>
				</div>

				{/* Price */}
				<input
					type="number"
					name="price"
					value={formState.price === 0 ? "0" : formState.price || ""}
					onChange={handleChange}
					className="w-full border px-3 py-2 rounded"
					step="0.01"
					min="0"
				/>

				{/* Dietaries */}
				<div className="mb-4">
					<label className="block text-sm font-medium mb-1">Dietary Options</label>
					<div className="border rounded p-2 space-y-2 max-h-32 overflow-y-auto">
						{restaurantDietaries.map((option) => (
							<label key={option} className="flex items-center space-x-2">
								<input
									type="checkbox"
									value={option}
									checked={formState.dietaries.includes(option)}
									onChange={handleDietaryChange}
									className="form-checkbox text-indigo-600"
								/>
								<span className="text-sm">{option}</span>
							</label>
						))}
					</div>
				</div>

				{/* Ingredients */}
				<div className="mb-6">
					<div className="flex justify-between items-center mb-2">
						<label className="block text-sm font-medium">Ingredients</label>
						<button type="button" onClick={addIngredient} className="text-blue-600 text-sm">
							+ Add Ingredient
						</button>
					</div>
					{formState.ingredients.map((ingredient, idx) => (
						<div key={ingredient.id} className="flex gap-2 mb-2">
							<input
								type="text"
								placeholder="Name"
								value={ingredient.name}
								onChange={(e) => updateIngredient(idx, "name", e.target.value)}
								className="flex-1 border px-2 py-1 rounded"
							/>
							<input
								type="text"
								placeholder="Quantity"
								value={ingredient.quantity || ""}
								onChange={(e) => updateIngredient(idx, "quantity", e.target.value)}
								className="w-32 border px-2 py-1 rounded"
							/>
							<button onClick={() => removeIngredient(idx)} className="text-red-600 text-xl font-bold">
								×
							</button>
						</div>
					))}
				</div>

				{/* Modifications */}
				<div className="mb-6">
					<div className="flex justify-between items-center mb-2">
						<label className="block text-sm font-medium">Modifications</label>
						<button type="button" onClick={addModificationGroup} className="text-blue-600 text-sm">
							+ Add Group
						</button>
					</div>
					{formState.modifications?.map((group, groupIdx) => (
						<div key={group.id} className="border p-3 rounded mb-3">
							<div className="flex gap-2 mb-2">
								<input
									type="text"
									placeholder="Group Name"
									value={group.name}
									onChange={(e) => updateModificationGroup(groupIdx, "name", e.target.value)}
									className="flex-1 border px-2 py-1 rounded"
								/>
								<input
									type="number"
									placeholder="Max Select"
									value={group.maxSelectable ?? ""}
									onChange={(e) => updateModificationGroup(groupIdx, "maxSelectable", parseInt(e.target.value))}
									className="w-28 border px-2 py-1 rounded"
								/>
								<label className="flex items-center gap-1 text-sm">
									<input
										type="checkbox"
										checked={group.required || false}
										onChange={(e) => updateModificationGroup(groupIdx, "required", e.target.checked)}
									/>
									Required
								</label>
								<button onClick={() => removeModificationGroup(groupIdx)} className="text-red-600 text-xl font-bold">
									×
								</button>
							</div>

							{/* Options */}
							<div className="mb-2">
								{group.options.map((option, optIdx) => (
									<div key={option.id} className="flex gap-2 mb-2">
										<input
											type="text"
											placeholder="Option Name"
											value={option.name}
											onChange={(e) => updateModificationOption(groupIdx, optIdx, "name", e.target.value)}
											className="flex-1 border px-2 py-1 rounded"
										/>
										<input
											type="number"
											placeholder="+/- Price"
											value={isNaN(option.priceModifier) ? "" : option.priceModifier}
											onChange={(e) => updateModificationOption(groupIdx, optIdx, "priceModifier", parseFloat(e.target.value))}
											className="w-28 border px-2 py-1 rounded"
										/>

										<button onClick={() => removeModificationOption(groupIdx, optIdx)} className="text-red-600 text-xl font-bold">
											×
										</button>
									</div>
								))}
							</div>

							<button type="button" onClick={() => addModificationOption(groupIdx)} className="text-blue-600 text-sm">
								+ Add Option
							</button>
						</div>
					))}
				</div>

				{/* Actions */}
				<div className="mt-6 flex justify-end gap-2">
					<button
						onClick={() => {
							if (confirm("Are you sure you want to delete this item?")) {
								onDelete(formState.id);
							}
						}}
						className="px-4 py-2 text-red-600 border border-red-600 hover:bg-red-600 hover:text-white rounded transition">
						Delete Item
					</button>
					<button onClick={onClose} className="px-4 py-2 hover:bg-red-500 bg-[var(--color-steel-blue)] text-black rounded transition">
						Cancel
					</button>
					<button
						onClick={handleSave}
						className="px-4 py-2 bg-(--color-black) text-white hover:text-black hover:bg-[var(--color-steel-blue)] rounded transition">
						Save Changes
					</button>
				</div>
			</div>
		</div>
	);
}

async function uploadImage(file: File): Promise<string> {
	const formData = new FormData();
	formData.append("file", file);

	const res = await fetch("/api/restaurant/upload", {
		method: "POST",
		body: formData,
	});

	if (!res.ok) {
		throw new Error("Image upload failed");
	}

	const data = await res.json();
	return data.url;
}
