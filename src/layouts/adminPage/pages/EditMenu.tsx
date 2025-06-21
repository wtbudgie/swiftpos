/**
 * File: EditMenuPage.tsx
 * Description: Menu management interface for SwiftPOS restaurants.
 * Allows editing of menu categories, items, and their properties with real-time saving.
 * Author: William Anderson
 * Created: 2025-06-21
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { Pen, Trash, Check, X } from "lucide-react";
import { SanitizedRestaurant } from "@/app/restaurant/[restaurantId]/admin/page";
import { Category, Item } from "@/types/RestaurantType";
import ConfirmModal from "@/components/modals/ConfirmModal";
import ItemCard from "@/components/cards/ItemCard";
import ItemModal from "@/components/modals/EditItemModal";

/**
 * Type: EditMenuPageProps
 *
 * Component props:
 * - restaurantData: SanitizedRestaurant — Contains restaurant menu data including items and categories
 */
type EditMenuPageProps = {
	restaurantData: SanitizedRestaurant;
};

/**
 * Component: EditMenuPage
 *
 * Input:
 * - Props as defined in EditMenuPageProps
 *
 * Output:
 * - React component rendering menu management interface
 *
 * Description:
 * Provides comprehensive menu editing capabilities:
 * - Category management (add/rename/delete)
 * - Item management (add/edit/delete)
 * - Real-time auto-saving
 * - Responsive grid layout
 * - Visual feedback for save states
 */
export default function EditMenuPage({ restaurantData }: EditMenuPageProps) {
	// ---- Data States ----
	const [items, setItems] = useState<Array<Item>>(restaurantData.items);
	const [categories, setCategories] = useState<Array<Category>>(restaurantData.categories);

	// Snapshot states for change detection
	const [originalItems, setOriginalItems] = useState(JSON.stringify(restaurantData.items));
	const [originalCategories, setOriginalCategories] = useState(JSON.stringify(restaurantData.categories));

	// ---- UI States ----
	const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
	const [selectedItem, setSelectedItem] = useState<Item>(restaurantData.items[0]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
	const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
	const [tempCategoryName, setTempCategoryName] = useState<string>("");

	// Default image for new items
	const defaultImage = "https://www.svgrepo.com/show/508699/landscape-placeholder.svg";

	// ---- Item & Category Handlers ----

	/**
	 * Handler: handleAddItem
	 * Input:
	 * - categoryId: string — The ID of the category to add the item to
	 *
	 * Description:
	 * Creates a new default item in the specified category
	 */
	const handleAddItem = (categoryId: string) => {
		const newItem: Item = {
			id: `itm-${Date.now()}`,
			name: "New Item",
			description: "",
			price: 0,
			isActive: true,
			categoryId,
			dietaries: [],
			ingredients: [],
			imageUrl: defaultImage,
			modifications: [],
			stockAmount: 0,
		};
		setItems((prev) => [...prev, newItem]);
	};

	/**
	 * Handler: handleAddCategory
	 *
	 * Description:
	 * Creates a new default category in the menu
	 */
	const handleAddCategory = () => {
		const newCategory: Category = {
			id: `cat-${Date.now()}`,
			name: "New Category",
			itemIds: [],
			description: "",
		};
		setCategories((prev) => [...prev, newCategory]);
	};

	/**
	 * Handler: handleRenameCategory
	 * Input:
	 * - categoryId: string — The ID of the category to rename
	 * - newName: string — The new name for the category
	 *
	 * Description:
	 * Updates a category's name and exits edit mode
	 */
	const handleRenameCategory = (categoryId: string, newName: string) => {
		setCategories((prev) => prev.map((cat) => (cat.id === categoryId ? { ...cat, name: newName } : cat)));
		setEditingCategoryId(null);
	};

	/**
	 * Handler: handleDeleteItem
	 * Input:
	 * - itemId: string — The ID of the item to delete
	 *
	 * Description:
	 * Removes an item from the menu and closes the edit modal
	 */
	const handleDeleteItem = (itemId: string) => {
		setItems((prev) => prev.filter((item) => item.id !== itemId));
		setIsModalOpen(false);
	};

	/**
	 * Handler: handleItemSave
	 * Input:
	 * - updatedItem: Item — The updated item data
	 *
	 * Description:
	 * Updates an existing item in the menu state and closes the modal
	 */
	const handleItemSave = (updatedItem: Item) => {
		setItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
		setIsModalOpen(false);
	};

	/**
	 * Handler: requestDeleteCategory
	 * Input:
	 * - category: Category — The category to potentially delete
	 *
	 * Description:
	 * Checks if category is empty and either shows confirmation or error
	 */
	const requestDeleteCategory = (category: Category) => {
		const hasItems = items.some((item) => item.categoryId === category.id);
		if (hasItems) {
			alert("You must remove all items in this category before deleting it.");
			return;
		}
		setCategoryToDelete(category);
		setIsConfirmModalOpen(true);
	};

	/**
	 * Handler: confirmDeleteCategory
	 *
	 * Description:
	 * Removes the selected category and any associated items
	 */
	const confirmDeleteCategory = () => {
		if (!categoryToDelete) return;
		setCategories((prev) => prev.filter((cat) => cat.id !== categoryToDelete.id));
		setItems((prev) => prev.filter((item) => item.categoryId !== categoryToDelete.id));
		setIsConfirmModalOpen(false);
		setCategoryToDelete(null);
	};

	// ---- Item Modal Management ----

	/**
	 * Handler: openItemModal
	 * Input:
	 * - item: Item — The item to edit
	 *
	 * Description:
	 * Opens the item edit modal with the selected item's data
	 */
	const openItemModal = (item: Item) => {
		setSelectedItem(item);
		setIsModalOpen(true);
	};

	/**
	 * Handler: closeItemModal
	 *
	 * Description:
	 * Closes the item edit modal without saving changes
	 */
	const closeItemModal = () => setIsModalOpen(false);

	// ---- Auto-save Logic ----

	/**
	 * Function: handleSaveRestaurant
	 *
	 * Description:
	 * Saves the current menu state to the server
	 * Handles loading states and error cases
	 */
	const handleSaveRestaurant = useCallback(async () => {
		try {
			setSaveStatus("saving");

			const res = await fetch(`/api/restaurant/${restaurantData._id}/config/save`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ restaurantId: restaurantData._id, items, categories }),
			});

			if (!res.ok) throw new Error("Failed to save");

			const data = await res.json();
			if (data.success) {
				setSaveStatus("saved");
				setTimeout(() => setSaveStatus("idle"), 3000);
			}
		} catch (err) {
			console.error("Save failed:", err);
			setSaveStatus("idle");
		}
	}, [restaurantData._id, items, categories]);

	// Auto-save effect
	useEffect(() => {
		if (saveStatus === "saving") return;

		const itemsChanged = JSON.stringify(items) !== originalItems;
		const categoriesChanged = JSON.stringify(categories) !== originalCategories;
		if (!itemsChanged && !categoriesChanged) return;

		const timer = setTimeout(() => {
			handleSaveRestaurant();
			setOriginalItems(JSON.stringify(items));
			setOriginalCategories(JSON.stringify(categories));
		}, 500);

		return () => clearTimeout(timer);
	}, [items, categories, saveStatus, handleSaveRestaurant]);

	// ---- Render ----
	return (
		<div className="w-full h-full">
			{/* Save Status Indicator */}
			{saveStatus !== "idle" && (
				<div className="fixed bottom-4 right-4 bg-white shadow-md px-4 py-2 rounded-md text-sm text-black border border-gray-300 animate-fade-in-out z-50 transition">
					{saveStatus === "saving" ? "Saving..." : "Saved!"}
				</div>
			)}

			{/* Confirmation Modal */}
			<ConfirmModal
				isOpen={isConfirmModalOpen}
				title="Delete Category"
				message={`Are you sure you want to delete "${categoryToDelete?.name}"? This cannot be undone.`}
				onCancel={() => setIsConfirmModalOpen(false)}
				onConfirm={confirmDeleteCategory}
			/>

			{/* Item Edit Modal */}
			<ItemModal
				isOpen={isModalOpen}
				onClose={closeItemModal}
				item={selectedItem}
				onSave={handleItemSave}
				onDelete={handleDeleteItem}
				restaurantDietaries={restaurantData.dietaries}
				restaurantId={restaurantData._id}
			/>

			{/* Scrollable Content Area */}
			<div
				className="overflow-y-auto max-h-[calc(100vh-220px)] space-y-8 px-2
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100
                [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300
                dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
				{/* Category Sections */}
				{categories.map((category) => {
					const categoryItems = items.filter((item) => item.categoryId === category.id && item.isActive);

					return (
						<div key={category.id} id={category.id} className="transition-opacity duration-500 ease-in opacity-0 animate-fadeIn">
							{/* Category Header */}
							<div className="flex items-center justify-between mb-4">
								{editingCategoryId === category.id ? (
									<input
										type="text"
										value={tempCategoryName}
										onChange={(e) => setTempCategoryName(e.target.value)}
										className="text-2xl font-semibold mb-4 border border-gray-300 rounded px-2 py-0 w-[50%]"
									/>
								) : (
									<h2 className="text-2xl font-semibold mb-4 text-black">{category.name}</h2>
								)}

								{/* Category Action Buttons */}
								<div className="flex space-x-2">
									<button
										onClick={() => handleAddItem(category.id)}
										className="px-2 py-1 bg-(--color-ice-blue) rounded hover:bg-(--color-white) hover:opacity-75 text-(--color-black) transition">
										Add Item
									</button>

									{editingCategoryId === category.id ? (
										<>
											<button
												onClick={() => handleRenameCategory(category.id, tempCategoryName)}
												className="px-2 py-1 bg-green-500 rounded hover:opacity-75 text-white transition">
												<Check size={16} />
											</button>
											<button
												onClick={() => setEditingCategoryId(null)}
												className="px-2 py-1 bg-gray-400 rounded hover:opacity-75 text-white transition">
												<X size={16} />
											</button>
										</>
									) : (
										<button
											onClick={() => {
												setEditingCategoryId(category.id);
												setTempCategoryName(category.name);
											}}
											className="px-2 py-1 bg-(--color-ice-blue) rounded hover:bg-(--color-white) hover:opacity-75 text-(--color-black) transition">
											<Pen size={16} />
										</button>
									)}

									<button
										onClick={() => requestDeleteCategory(category)}
										className="px-2 py-2 bg-red-500 rounded hover:bg-(--color-white) hover:opacity-75 text-(--color-black) transition">
										<Trash size={16} />
									</button>
								</div>
							</div>

							{/* Items Grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{categoryItems.map((item) => (
									<div key={item.id} className="w-full">
										<ItemCard item={item} onClick={openItemModal} buttonLabel="Edit Item" />
									</div>
								))}
							</div>
						</div>
					);
				})}

				{/* Add Category Button */}
				<div className="flex justify-center">
					<button
						onClick={handleAddCategory}
						className="mt-2 self-start bg-(--color-steel-blue) hover:bg-(--color-ice-blue) text-white hover:text-(--color-black) hover:outline px-4 py-2 rounded-md text-sm transition cursor-pointer w-[50%]">
						Create New Category
					</button>
				</div>
			</div>
		</div>
	);
}

/**
 * Testing Notes:
 * - Verify category creation/renaming/deletion
 * - Test item creation/editing/deletion
 * - Check auto-save functionality
 * - Verify error handling for non-empty category deletion
 * - Test responsive grid layout
 * - Check scroll behavior with many items
 * - Verify modal interactions
 * - Test save status indicators
 * - Check dark mode compatibility
 * - Verify image upload functionality
 */
