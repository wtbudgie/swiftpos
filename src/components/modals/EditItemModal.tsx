/**
 * File: EditItemModal.tsx
 * Description: Modal component for editing menu items in SwiftPOS, including their details,
 * ingredients, and modification options. Handles image uploads and form state management.
 * Author: William Anderson
 */

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

import { Item, Ingredient, ModificationGroup, ModificationOption } from "@/types/RestaurantType";

/**
 * Type: EditItemModalProps
 *
 * Props for the EditItemModal component:
 * - isOpen: boolean — controls modal visibility
 * - onClose: () => void — callback to close modal
 * - item: Item — the item being edited
 * - onSave: (updatedItem: Item) => void — callback when saving changes
 * - onDelete: (itemId: string) => void — callback when deleting item
 * - restaurantDietaries: string[] — available dietary options for the restaurant
 * - restaurantId: string — ID of the current restaurant
 */
type EditItemModalProps = {
	isOpen: boolean;
	onClose: () => void;
	item: Item;
	onSave: (updatedItem: Item) => void;
	onDelete: (itemId: string) => void;
	restaurantDietaries: string[];
	restaurantId: string;
};

/**
 * Component: EditItemModal
 *
 * Input:
 * - Props as defined in EditItemModalProps
 *
 * Output:
 * - React component rendering a modal form
 * - Calls onSave with updated item data when saved
 * - Calls onDelete when item is deleted
 *
 * Description:
 * Provides a comprehensive interface for editing all aspects of a menu item including:
 * - Basic details (name, description, price)
 * - Image upload and preview
 * - Dietary options selection
 * - Ingredients management
 * - Modification groups and options
 * Handles form state management and validation internally.
 */
export default function EditItemModal({ isOpen, onClose, item, onSave, onDelete, restaurantDietaries, restaurantId }: EditItemModalProps) {
	const timestamp = Date.now();
	const [formState, setFormState] = useState<Item>(item);
	const [imagePreview, setImagePreview] = useState<string | null>(item.imageUrl || null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Reset form when item prop changes
	useEffect(() => {
		setFormState(item);
	}, [item]);

	// ----- Form Handlers -----

	/**
	 * Handler: handleChange
	 * Input:
	 * - e: React.ChangeEvent — form input change event
	 *
	 * Description:
	 * Updates form state for basic text/number inputs. Special handling for price field
	 * to ensure numeric value.
	 */
	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormState((prev) => ({
			...prev,
			[name]: name === "price" ? parseFloat(value) : value,
		}));
	};

	/**
	 * Handler: handleDietaryChange
	 * Input:
	 * - e: React.ChangeEvent — checkbox change event
	 *
	 * Description:
	 * Toggles dietary options in form state, adding or removing the selected option
	 * from the dietaries array.
	 */
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

	/**
	 * Handler: handleSave
	 *
	 * Description:
	 * Triggers the onSave callback with current form state and closes the modal.
	 */
	const handleSave = () => {
		if (!validateForm()) {
			alert("Please fix the errors before saving.");
			return;
		}
		onSave(formState);
		onClose();
	};

	/**
	 * Handler: handleBackdropClick
	 *
	 * Description:
	 * Placeholder for potential backdrop click handling. Currently disabled to prevent
	 * accidental closure with unsaved changes.
	 */
	const handleBackdropClick = () => {
		//onClose();
	};

	// ----- Ingredients Management -----

	/**
	 * Function: addIngredient
	 *
	 * Description:
	 * Adds a new empty ingredient to the form state with a unique timestamp-based ID.
	 */
	const addIngredient = () => {
		setFormState((prev) => ({
			...prev,
			ingredients: [
				...prev.ingredients,
				{
					id: `ing-${timestamp}`,
					name: "",
					quantity: "",
				},
			],
		}));
	};

	/**
	 * Function: updateIngredient
	 * Input:
	 * - index: number — position in ingredients array
	 * - field: keyof Ingredient — field to update
	 * - value: string — new value
	 *
	 * Description:
	 * Updates a specific field of an ingredient at the given index.
	 */
	const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
		const updated = [...formState.ingredients];
		updated[index][field] = value;
		setFormState((prev) => ({ ...prev, ingredients: updated }));
	};

	/**
	 * Function: removeIngredient
	 * Input:
	 * - index: number — position in ingredients array
	 *
	 * Description:
	 * Removes the ingredient at the specified index from the form state.
	 */
	const removeIngredient = (index: number) => {
		const updated = [...formState.ingredients];
		updated.splice(index, 1);
		setFormState((prev) => ({ ...prev, ingredients: updated }));
	};

	// ----- Modifications Management -----

	/**
	 * Function: addModificationGroup
	 *
	 * Description:
	 * Adds a new empty modification group to the form state with default values
	 * and a unique timestamp-based ID.
	 */
	const addModificationGroup = () => {
		const newGroup: ModificationGroup = {
			id: `modgrp-${timestamp}`,
			name: "",
			options: [],
			required: false,
			maxSelectable: 5,
		};
		setFormState((prev) => ({
			...prev,
			modifications: [...(prev.modifications || []), newGroup],
		}));
	};

	/**
	 * Function: updateModificationGroup
	 * Input:
	 * - index: number — position in modifications array
	 * - field: K — field to update
	 * - value: ModificationGroup[K] — new value
	 *
	 * Description:
	 * Updates a specific field of a modification group at the given index.
	 */
	const updateModificationGroup = <K extends keyof ModificationGroup>(index: number, field: K, value: ModificationGroup[K]) => {
		const updated = [...(formState.modifications || [])];
		updated[index][field] = value;
		setFormState((prev) => ({ ...prev, modifications: updated }));
	};

	/**
	 * Function: removeModificationGroup
	 * Input:
	 * - index: number — position in modifications array
	 *
	 * Description:
	 * Removes the modification group at the specified index from the form state.
	 */
	const removeModificationGroup = (index: number) => {
		const updated = [...(formState.modifications || [])];
		updated.splice(index, 1);
		setFormState((prev) => ({ ...prev, modifications: updated }));
	};

	/**
	 * Function: addModificationOption
	 * Input:
	 * - groupIndex: number — position of parent group in modifications array
	 *
	 * Description:
	 * Adds a new empty option to the specified modification group with default values
	 * and a unique timestamp-based ID.
	 */
	const addModificationOption = (groupIndex: number) => {
		const group = formState.modifications?.[groupIndex];
		if (!group) return;

		const newOption: ModificationOption = {
			id: `mod-${timestamp}`,
			name: "",
			priceModifier: 0,
		};

		const updatedGroups = [...formState.modifications!];
		updatedGroups[groupIndex].options.push(newOption);
		setFormState((prev) => ({ ...prev, modifications: updatedGroups }));
	};

	/**
	 * Function: updateModificationOption
	 * Input:
	 * - groupIndex: number — position of parent group
	 * - optionIndex: number — position of option in group
	 * - field: K — field to update
	 * - value: ModificationOption[K] — new value
	 *
	 * Description:
	 * Updates a specific field of a modification option with special handling for
	 * numeric priceModifier fields to prevent NaN values.
	 */
	const updateModificationOption = <K extends keyof ModificationOption>(groupIndex: number, optionIndex: number, field: K, value: ModificationOption[K]) => {
		if (field === "priceModifier" && typeof value === "number" && isNaN(value)) {
			value = 0 as ModificationOption[K]; // default fallback
		}

		const updatedGroups = [...(formState.modifications || [])];
		updatedGroups[groupIndex].options[optionIndex][field] = value;
		setFormState((prev) => ({ ...prev, modifications: updatedGroups }));
	};

	/**
	 * Function: removeModificationOption
	 * Input:
	 * - groupIndex: number — position of parent group
	 * - optionIndex: number — position of option in group
	 *
	 * Description:
	 * Removes the specified option from its modification group.
	 */
	const removeModificationOption = (groupIndex: number, optionIndex: number) => {
		const updatedGroups = [...formState.modifications!];
		updatedGroups[groupIndex].options.splice(optionIndex, 1);
		setFormState((prev) => ({ ...prev, modifications: updatedGroups }));
	};

	/**
	 * Function: validateForm
	 * Input: none
	 *
	 * Description:
	 * Validates all inputs in the form, providing an error if one exists.
	 */
	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		// Validate item name (required, non-empty)
		if (!formState.name.trim()) {
			newErrors.name = "Name is required";
		}

		if (!formState.description.trim()) {
			newErrors.description = "Description is required";
		}

		// Validate price (required, numeric, >=0)
		if (formState.price === undefined || formState.price === null || isNaN(formState.price)) {
			newErrors.price = "Price must be a valid number";
		} else if (formState.price < 0) {
			newErrors.price = "Price cannot be negative";
		}

		// Validate ingredients: each must have a non-empty name and quantity
		formState.ingredients.forEach((ingredient, idx) => {
			if (!ingredient.name.trim()) {
				newErrors[`ingredient-name-${idx}`] = "Ingredient name required";
			}
			if (!ingredient.quantity.trim()) {
				newErrors[`ingredient-quantity-${idx}`] = "Ingredient quantity required";
			}
		});

		// Validate modification groups: name required, maxSelectable must be number or empty, options required
		formState.modifications?.forEach((group, groupIdx) => {
			if (!group.name.trim()) {
				newErrors[`mod-group-name-${groupIdx}`] = "Modification group name required";
			}
			if (group.maxSelectable !== undefined && group.maxSelectable !== null) {
				if (isNaN(group.maxSelectable) || group.maxSelectable < 0) {
					newErrors[`mod-group-maxSelectable-${groupIdx}`] = "Max selectable must be a positive number";
				}
			}
			group.options.forEach((option, optIdx) => {
				if (!option.name.trim()) {
					newErrors[`mod-option-name-${groupIdx}-${optIdx}`] = "Modification option name required";
				}
				if (isNaN(option.priceModifier)) {
					newErrors[`mod-option-priceModifier-${groupIdx}-${optIdx}`] = "Price modifier must be a number";
				}
			});
		});

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Reset form when item changes
	useEffect(() => {
		setFormState(item);
		setImagePreview(item.imageUrl || null);
	}, [item]);

	// ----- Component Render -----
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

				{/* Image Upload Section */}
				<div className="mb-4">
					<label className="block text-sm font-medium mb-1">Upload Image (We recommend a 4:3 image with a minimum of 400x300)</label>
					<input
						type="file"
						accept="image/*"
						onChange={async (e) => {
							const file = e.target.files?.[0];
							if (file) {
								try {
									const url = await uploadImage(file, restaurantId);
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

				{/* Name Field */}
				<div className="mb-4">
					<label className="block text-sm font-medium mb-1">Name (max 50 chars)</label>
					<input type="text" name="name" value={formState.name} onChange={handleChange} className="w-full border px-3 py-2 rounded" maxLength={50} />
					{errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
				</div>

				{/* Description Field */}
				<div className="mb-4">
					<label className="block text-sm font-medium mb-1">Description (max 250 chars)</label>
					<textarea
						name="description"
						value={formState.description || ""}
						onChange={handleChange}
						className="w-full border px-3 py-2 rounded"
						rows={3}
						maxLength={250}
					/>
					{errors.description && <p className="text-red-600 text-sm mb-1">{errors.description}</p>}
				</div>

				{/* Price Field */}
				<div>
					<label className="block font-medium mb-1">Price ($)</label>
					<input
						type="number"
						name="price"
						min={0}
						max={15000}
						step={0.01}
						value={formState.price}
						onChange={handleChange}
						className="w-full border px-3 py-2 rounded"
					/>
					{errors.price && <p className="text-red-600 text-sm mb-1">{errors.price}</p>}
				</div>

				{/* Dietary Options Section */}
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

				{/* Ingredients Management Section */}
				<div className="mb-6">
					<div className="flex justify-between items-center mb-2">
						<label className="block text-sm font-medium">Ingredients (max 30 chars - max 20 chars)</label>
						<button type="button" onClick={addIngredient} className="text-blue-600 text-sm">
							+ Add Ingredient
						</button>
					</div>
					{formState.ingredients.map((ingredient, idx) => (
						<div key={ingredient.id} className="flex gap-2 mb-2">
							<input
								type="text"
								placeholder="Ingredient Name"
								value={ingredient.name}
								onChange={(e) => updateIngredient(idx, "name", e.target.value)}
								className={`border rounded px-3 py-2 flex-1 ${errors[`ingredient-name-${idx}`] ? "border-red-600 border-8" : ""}`}
								maxLength={30}
							/>
							<input
								type="text"
								placeholder="Quantity"
								value={ingredient.quantity}
								onChange={(e) => updateIngredient(idx, "quantity", e.target.value)}
								className={`border rounded px-3 py-2 flex-1 ${errors[`ingredient-quantity-${idx}`] ? "border-red-600 border-8" : ""}`}
								min={0}
								max={150}
							/>
							<button onClick={() => removeIngredient(idx)} className="text-red-600 text-xl font-bold">
								×
							</button>
						</div>
					))}
				</div>

				{/* Modifications Management Section */}
				<div className="mb-6">
					<div className="flex justify-between items-center mb-2">
						<label className="block text-sm font-medium">Modifications (max 30 chars)</label>
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
									className={`flex-1 border px-2 py-1 rounded ${errors[`mod-group-name-${groupIdx}`] ? "border-red-600" : ""}`}
									maxLength={30}
								/>
								<input
									type="number"
									placeholder="Max Select"
									value={group.maxSelectable ?? ""}
									onChange={(e) => updateModificationGroup(groupIdx, "maxSelectable", parseInt(e.target.value))}
									className={`w-28 border px-2 py-1 rounded ${errors[`mod-group-maxSelectable-${groupIdx}`] ? "border-red-600" : ""}`}
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

							{/* Modification Options List */}
							<div className="mb-2">
								{group.options.map((option, optIdx) => (
									<div key={option.id} className="flex gap-2 mb-2">
										<input
											type="text"
											placeholder="Option Name"
											value={option.name}
											onChange={(e) => updateModificationOption(groupIdx, optIdx, "name", e.target.value)}
											className={`flex-1 border px-2 py-1 rounded ${
												errors[`mod-option-name-${groupIdx}-${optIdx}`] ? "border-red-600" : ""
											}`}
											maxLength={30}
										/>
										<input
											type="number"
											placeholder="+/- Price"
											value={isNaN(option.priceModifier) ? "" : option.priceModifier}
											onChange={(e) => updateModificationOption(groupIdx, optIdx, "priceModifier", parseFloat(e.target.value))}
											className={`w-28 border px-2 py-1 rounded ${
												errors[`mod-option-price-${groupIdx}-${optIdx}`] ? "border-red-600" : ""
											}`}
											min={-5}
											max={150}
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

				{/* Action Buttons */}
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

/**
 * Function: uploadImage
 * Input:
 * - file: File — image file to upload
 * - restaurantId: string — ID of restaurant for API route
 *
 * Output:
 * - Promise<string> — resolves to image URL
 *
 * Description:
 * Handles image upload to server via API endpoint. Throws error if upload fails.
 */
async function uploadImage(file: File, restaurantId: string): Promise<string> {
	const formData = new FormData();
	formData.append("file", file);

	const res = await fetch(`/api/restaurant/${restaurantId}/upload`, {
		method: "POST",
		body: formData,
	});

	if (!res.ok) {
		throw new Error("Image upload failed");
	}

	const data = await res.json();
	return data.url;
}

/**
 * Testing Notes:
 * - Verify modal opens/closes properly based on isOpen prop
 * - Test image upload functionality with various file types
 * - Validate all form fields update state correctly
 * - Test ingredient addition/removal functionality
 * - Test modification group and option management
 * - Verify save/delete callbacks trigger with correct data
 * - Test dietary options selection behavior
 * - Validate price field handles numeric input correctly
 * - Test component responsiveness and overflow behavior
 */
