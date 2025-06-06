"use client";

import { useRef, useState } from "react";

import { Session } from "next-auth";
import Link from "next/link";

import { ReturnedRestaurant } from "@/app/restaurant/[restaurantId]/page";
import SidebarSection from "@/layouts/restaurantPage/sections/SidebarSection";
import HeaderSection from "@/layouts/restaurantPage/sections/HeaderSection";

import ItemCard from "@/components/cards/ItemCard";
import ItemModal, { SelectedMods } from "@/components/modals/ItemModal";

import { Item, ModificationGroup, ModificationOption } from "@/types/RestaurantType";
import { OrderedItem } from "@/types/OrderType";

type RestaurantLayoutProps = {
	restaurantData: ReturnedRestaurant;
	session: Session | null;
};

export default function RestaurantLayout({ restaurantData, session }: RestaurantLayoutProps) {
	const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
	const [cartItems, setCartItems] = useState<Array<OrderedItem>>([]);

	const [selectedMods, setSelectedMods] = useState<SelectedMods>({});
	const [customText, setCustomText] = useState<string | undefined>(undefined);
	const [itemLocation, setItemLocation] = useState<"cart" | "list">("list");

	const [isCheckingOut, setIsCheckingOut] = useState(false);

	const handleCheckout = async () => {
		if (cartItems.length === 0) {
			//setCheckoutError("Your cart is empty.");
			return;
		}

		setIsCheckingOut(true);

		try {
			const res = await fetch("/api/restaurant/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					restaurantId: restaurantData._id,
					cart: cartItems,
				}),
			});

			const data = await res.json();
			console.log(data);

			if (!res.ok) {
				//setCheckoutError(data.error || "Checkout failed.");
			} else {
				//setCheckoutSuccess(true);
				// Optionally clear cart on success:
				setCartItems([]);
			}
		} catch (error) {
			console.error(error);
			//setCheckoutError("Network error, please try again.");
		} finally {
			setIsCheckingOut(false);
		}
	};

	const cartTotal = cartItems.reduce((sum, item: OrderedItem) => sum + item.totalPrice * item.quantity, 0);

	function convertModsToSelectedMods(mods: ModificationOption[], modificationGroups: ModificationGroup[]): SelectedMods {
		const selected: SelectedMods = {};

		for (const group of modificationGroups) {
			selected[group.id] = [];
			for (const mod of mods) {
				if (group.options.find((opt) => opt.id === mod.id)) {
					selected[group.id].push(mod.id);
				}
			}
			if (selected[group.id].length === 0) {
				delete selected[group.id]; // remove empty groups
			}
		}
		return selected;
	}

	const [isItemModalOpen, setItemModalOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<Item>(restaurantData.items[0]);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [editingQuantity, setEditingQuantity] = useState<number>(1);

	const openItemModal = (item: Item, from: "cart" | "list", mods?: ModificationOption[], customTxt?: string, quantity?: number) => {
		const index = cartItems.findIndex(
			(cartItem) =>
				cartItem.itemId === item.id && (cartItem.customText || "") === (customTxt || "") && areModsEqual(cartItem.modifications || [], mods || [])
		);
		console.log(cartItems, item.id);

		setItemLocation(from);
		setSelectedItem(item);
		setSelectedMods(mods && item.modifications ? convertModsToSelectedMods(mods, item.modifications) : {});
		setCustomText(customTxt);
		setEditingIndex(index !== -1 ? index : null);
		setEditingQuantity(quantity || 1);
		setItemModalOpen(true);
	};

	const updateQuantity = (id: string, delta: number) => {
		setCartItems((items) => {
			return items
				.map((item: OrderedItem) => (item.itemId === id ? { ...item, quantity: item.quantity + delta } : item))
				.filter((item) => item.quantity > 0);
		});
	};

	const scrollToCategory = (categoryId: string) => {
		const section = sectionRefs.current[categoryId];
		if (section) {
			section.scrollIntoView({ behavior: "smooth" });
		}
	};

	// Helper to calculate total price per item including mods (in cents)
	function calculateTotalPrice(basePrice: number, mods?: ModificationOption[]) {
		const modsTotal = mods?.reduce((sum, mod) => sum + mod.priceModifier, 0) || 0;
		return basePrice + modsTotal;
	}

	// Helper to compare two modifications arrays ignoring order
	function areModsEqual(modsA: ModificationOption[] = [], modsB: ModificationOption[] = []): boolean {
		if (modsA.length !== modsB.length) return false;

		const sortedA = [...modsA].sort((a, b) => a.id.localeCompare(b.id));
		const sortedB = [...modsB].sort((a, b) => a.id.localeCompare(b.id));

		return sortedA.every((mod, idx) => mod.id === sortedB[idx].id && mod.name === sortedB[idx].name && mod.priceModifier === sortedB[idx].priceModifier);
	}

	function getSelectedModificationOptions(selectedMods: SelectedMods, modificationGroups: ModificationGroup[]): ModificationOption[] {
		const selectedOptions: ModificationOption[] = [];

		for (const group of modificationGroups) {
			const selectedOptionIds = selectedMods[group.id] || [];

			selectedOptionIds.forEach((optionId) => {
				const option = group.options.find((opt) => opt.id === optionId);
				if (option) {
					selectedOptions.push(option);
				}
			});
		}

		return selectedOptions;
	}

	return (
		<>
			<div className="w-screen min-h-screen bg-gray-100 grid grid-cols-[2fr_6fr]">
				<ItemModal
					item={selectedItem!}
					isOpen={isItemModalOpen}
					onClose={() => {
						setItemModalOpen(false);
						setEditingIndex(null);
					}}
					initialSelectedMods={selectedMods}
					initialCustomText={customText}
					initialQuantity={editingQuantity}
					isEditing={editingIndex !== null}
					onAddToCart={(item, quantity, selectedMods, customText) => {
						const mods = selectedMods && item.modifications ? getSelectedModificationOptions(selectedMods, item.modifications) : [];
						const totalPrice = calculateTotalPrice(item.price, mods);

						setCartItems((prev) => {
							const newItem: OrderedItem = {
								itemId: item.id,
								name: item.name,
								quantity,
								basePrice: item.price,
								totalPrice,
								modifications: mods,
								customText,
							};

							console.log(editingIndex);

							if (editingIndex !== null) {
								const updated = [...prev];

								const existingIndex = updated.findIndex(
									(cartItem) =>
										cartItem.itemId === item.id &&
										(cartItem.customText || "") === (customText || "") &&
										areModsEqual(cartItem.modifications || [], mods)
								);

								if (existingIndex !== -1) {
									if (itemLocation == "cart") {
										updated[existingIndex].quantity = quantity;
									} else if (itemLocation == "list") {
										updated[existingIndex].quantity += quantity;
									}
								} else {
									updated.push(newItem);
								}

								return updated;
							} else {
								// Not editing, just adding
								const existingIndex = prev.findIndex(
									(cartItem) =>
										cartItem.itemId === item.id &&
										(cartItem.customText || "") === (customText || "") &&
										areModsEqual(cartItem.modifications || [], mods)
								);

								if (existingIndex !== -1) {
									const updated = [...prev];

									updated[existingIndex].quantity += quantity;
									return updated;
								} else {
									return [...prev, newItem];
								}
							}
						});

						setItemModalOpen(false);
						setEditingIndex(null);
					}}
				/>

				{/* Sidebar */}
				<div className="row-span-full bg-(--color-gray) relative border-r-2 border-black flex flex-col py-10 px-4">
					{/* Restaurant Title */}
					<h1 className="text-3xl font-semibold decoration-[2px] text-(--color-ice-blue) text-center">{restaurantData?.name || "Restaurant"}</h1>
					<div className="w-[70%] border-t-2 border-(--color-white) mx-auto mb-6 mt-4" />
					<SidebarSection restaurantData={restaurantData} onCategoryClick={scrollToCategory} />

					<div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[90%] flex flex-col items-center space-y-2 ">
						<div className="w-full px-2">
							<p className="text-xl font-bold text-left mb-2 text-(--color-white)">
								Your Order: <span className="text-sm font-medium">(click to edit)</span>
							</p>
							<div className="w-[90%] border-t-2 border-[--color-white] mx-auto mb-2" />

							<ul
								className="h-40 overflow-y-auto pr-1 flex flex-col gap-3
                                    [&::-webkit-scrollbar]:w-2
                                    [&::-webkit-scrollbar-track]:rounded-full
                                    [&::-webkit-scrollbar-track]:bg-gray-100
                                    [&::-webkit-scrollbar-thumb]:rounded-full
                                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                                    dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                                    dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
								{cartItems.map((item) => {
									const fullItem = restaurantData.items.find((i) => i.id === item.itemId);
									return (
										<li
											key={`${item.itemId}-${item.customText || ""}-${item.modifications?.map((m) => m.id).join(",")}`}
											className="w-full px-2 py-1 cursor-pointer rounded bg-(--color-ice-blue) transition"
											onClick={() => {
												if (fullItem) {
													openItemModal(fullItem, "cart", item.modifications, item.customText, item.quantity);
												}
											}}>
											<div className="flex justify-between items-center">
												{/* Quantity controls */}
												<div className="flex items-center gap-2">
													<button
														onClick={(e) => {
															e.stopPropagation();
															updateQuantity(item.itemId, -1);
														}}
														className="px-2 py-1 bg-(--color-steel-blue) rounded hover:bg-(--color-black) hover:text-white text-(--color-black) transition">
														–
													</button>
													<span className="w-6 text-center">{item.quantity}</span>
													<button
														onClick={(e) => {
															e.stopPropagation();
															updateQuantity(item.itemId, 1);
														}}
														className="px-2 py-1 bg-(--color-steel-blue) rounded hover:bg-(--color-black) hover:text-white text-(--color-black) transition">
														+
													</button>
													<p className="text-xl font-bold ml-2">{item.name}</p>
												</div>
												<p className="text-xl font-medium">${(item.totalPrice * item.quantity).toFixed(2)}</p>
											</div>
										</li>
									);
								})}
							</ul>
						</div>

						<div className="flex justify-between items-center w-full px-2">
							<p className="text-xl font-bold text-left text-(--color-white)">Cart Total:</p>
							<p className="text-2xl font-black text-(--color-white)">${cartTotal.toFixed(2)}</p>
						</div>

						<button
							className="relative bg-(--color-ice-blue) text-black px-6 py-3 rounded-4xl font-semibold hover:bg-(--color-steel-blue) hover:text-(--color-white) transition w-[70%] cursor-pointer"
							onClick={handleCheckout}
							disabled={isCheckingOut || cartItems.length == 0}>
							{isCheckingOut ? "Checking out..." : "Go To Checkout"}
						</button>
					</div>
				</div>

				{/* Main Content */}
				<div className="col-start-2 flex flex-col gap-6 px-6 max-w-[1300px] mx-auto w-full">
					{/* Header section */}
					<HeaderSection registerOpen={!session?.user.onboarded} user={session?.user ?? null} />

					{/* Item Layout */}
					<div
						className="overflow-y-auto max-h-[calc(100vh-220px)] space-y-8 px-2
                        {/* scroll bar */}
						[&::-webkit-scrollbar]:w-2
						[&::-webkit-scrollbar-track]:rounded-full
						[&::-webkit-scrollbar-track]:bg-gray-100
						[&::-webkit-scrollbar-thumb]:rounded-full
						[&::-webkit-scrollbar-thumb]:bg-gray-300
						dark:[&::-webkit-scrollbar-track]:bg-neutral-700
						dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
						{/* Filter through all categories that the restaurant has (e.g entrees, drinks, etc) */}

						{restaurantData?.categories.map((category) => {
							const items = restaurantData.items.filter((item) => item.categoryId === category.id && item.isActive);

							return (
								<div
									key={category.id}
									ref={(el) => {
										sectionRefs.current[category.id] = el;
									}}
									id={category.id}
									className="transition-opacity duration-500 ease-in opacity-0 animate-fadeIn">
									<h2 className="text-2xl font-semibold mb-4 text-black">{category.name}</h2>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										{items.map((item) => (
											<ItemCard key={item.id} item={item} onClick={() => openItemModal(item, "list")} />
										))}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 text-gray-600 text-sm select-none">
				Powered by SwiftPOS{" | "}
				<Link href="/" className="pointer-events-auto underline">
					Go Back Home
				</Link>
			</div>
		</>
	);
}
