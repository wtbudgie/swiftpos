/**
 * File: RestaurantLayout.tsx
 *
 * Description:
 * Main layout component for SwiftPOS restaurant interface that provides:
 * - Category navigation sidebar
 * - Menu item display and selection
 * - Shopping cart functionality
 * - Checkout flow integration
 *
 * Author: William Anderson
 */

"use client";
import { useEffect, useRef, useState } from "react";
import { Session } from "next-auth";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";

// Components
import SidebarSection from "@/layouts/restaurantPage/sections/SidebarSection";
import HeaderSection from "@/layouts/restaurantPage/sections/HeaderSection";
import ItemCard from "@/components/cards/ItemCard";
import ItemModal, { SelectedMods } from "@/components/modals/ItemModal";
import CheckoutModal from "@/components/modals/CheckoutModal";

// Types
import { ReturnedRestaurant } from "@/app/restaurant/[restaurantId]/page";
import { Item, ModificationGroup, ModificationOption } from "@/types/RestaurantType";
import { OrderedItem } from "@/types/OrderType";

/**
 * Type: RestaurantLayoutProps
 *
 * Properties:
 * - restaurantData: ReturnedRestaurant — Complete restaurant data including menu items
 * - session: Session | null — Current user session information
 */
type RestaurantLayoutProps = {
	restaurantData: ReturnedRestaurant;
	session: Session | null;
};

/**
 * Component: RestaurantLayout
 *
 * Props:
 * - restaurantData: ReturnedRestaurant
 * - session: Session | null
 *
 * Description:
 * Provides the complete restaurant ordering interface with:
 * - Category navigation sidebar with auto-scrolling
 * - Searchable menu item grid
 * - Interactive shopping cart
 * - Checkout flow with Stripe integration
 *
 * Features:
 * - Real-time cart updates
 * - Item modification support
 * - Intersection observers for category tracking
 * - Responsive design
 */
export default function RestaurantLayout({ restaurantData, session }: RestaurantLayoutProps) {
	// State for search functionality
	const [searchQuery, setSearchQuery] = useState("");

	// Stripe payment integration
	const [stripePromise] = useState(() => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!));

	// Refs for scroll and intersection observation
	const scrollContainerRef = useRef<HTMLDivElement | null>(null);
	const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

	// Category and cart state
	const [currentCategory, setCurrentCategory] = useState<string | null>(restaurantData.categories[0].id);
	const [cartItems, setCartItems] = useState<OrderedItem[]>([]);
	const [cartTotal, setCartTotal] = useState(0);

	// Modal and item selection state
	const [isCheckingOut, setIsCheckingOut] = useState(false);
	const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
	const [isItemModalOpen, setItemModalOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<Item>(restaurantData.items[0]);
	const [selectedMods, setSelectedMods] = useState<SelectedMods>({});
	const [customText, setCustomText] = useState<string>();
	const [itemLocation, setItemLocation] = useState<"cart" | "list">("list");
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [editingQuantity, setEditingQuantity] = useState<number>(1);

	// Calculate cart total whenever items change
	useEffect(() => {
		setCartTotal(cartItems.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0));
	}, [cartItems]);

	/**
	 * Effect: Set up intersection observers for category tracking
	 *
	 * Description:
	 * Observes menu sections to automatically update the active category
	 * when scrolling through the menu.
	 */
	useEffect(() => {
		const observerOptions = {
			root: scrollContainerRef.current,
			rootMargin: "-20% 0px -70% 0px",
			threshold: 0.1,
		};

		const observers: IntersectionObserver[] = [];

		restaurantData.categories.forEach((category) => {
			const element = sectionRefs.current[category.id];
			if (element) {
				const observer = new IntersectionObserver((entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							setCurrentCategory(category.id);
							console.log(category.id);
						}
					});
				}, observerOptions);

				observer.observe(element);
				observers.push(observer);
			}
		});

		return () => {
			observers.forEach((observer) => observer.disconnect());
		};
	}, [restaurantData.categories]);

	/**
	 * Function: scrollToCategory
	 *
	 * Description:
	 * Smoothly scrolls to the specified category section
	 *
	 * @param categoryId - ID of the category to scroll to
	 */
	const scrollToCategory = (categoryId: string) => {
		sectionRefs.current[categoryId]?.scrollIntoView({ behavior: "smooth" });
	};

	/**
	 * Function: calculateTotalPrice
	 *
	 * Description:
	 * Calculates the total price of an item including modifications
	 *
	 * @param basePrice - Base price of the item
	 * @param mods - Selected modification options
	 * @returns Total calculated price
	 */
	const calculateTotalPrice = (basePrice: number, mods?: ModificationOption[]) => {
		return basePrice + (mods?.reduce((sum, mod) => sum + mod.priceModifier, 0) || 0);
	};

	/**
	 * Function: areModsEqual
	 *
	 * Description:
	 * Compares two sets of modifications for equality
	 *
	 * @param modsA - First set of modifications
	 * @param modsB - Second set of modifications
	 * @returns Boolean indicating if modifications are equal
	 */
	const areModsEqual = (modsA: ModificationOption[] = [], modsB: ModificationOption[] = []) => {
		if (modsA.length !== modsB.length) return false;
		const sortedA = modsA.map((m) => m.id).sort();
		const sortedB = modsB.map((m) => m.id).sort();
		return sortedA.every((id, idx) => id === sortedB[idx]);
	};

	/**
	 * Function: convertModsToSelectedMods
	 *
	 * Description:
	 * Converts modification options to a selected modifications object
	 *
	 * @param mods - Modification options to convert
	 * @param groups - Available modification groups
	 * @returns Selected modifications object
	 */
	const convertModsToSelectedMods = (mods: ModificationOption[], groups: ModificationGroup[]): SelectedMods => {
		const selected: SelectedMods = {};
		for (const group of groups) {
			const matched = mods.filter((mod) => group.options.some((opt) => opt.id === mod.id));
			if (matched.length) selected[group.id] = matched.map((m) => m.id);
		}
		return selected;
	};

	/**
	 * Function: getSelectedModificationOptions
	 *
	 * Description:
	 * Gets modification options from selected modification IDs
	 *
	 * @param selectedMods - Selected modification IDs
	 * @param groups - Available modification groups
	 * @returns Array of modification options
	 */
	const getSelectedModificationOptions = (selectedMods: SelectedMods, groups: ModificationGroup[]) => {
		return groups.flatMap(
			(group) => (selectedMods[group.id] || []).map((id) => group.options.find((opt) => opt.id === id)).filter(Boolean) as ModificationOption[]
		);
	};

	/**
	 * Function: updateQuantity
	 *
	 * Description:
	 * Updates the quantity of an item in the cart
	 *
	 * @param id - ID of the item to update
	 * @param delta - Amount to change the quantity by
	 */
	const updateQuantity = (id: string, delta: number) => {
		setCartItems((items) =>
			items.map((item) => (item.itemId === id ? { ...item, quantity: item.quantity + delta } : item)).filter((item) => item.quantity > 0)
		);
	};

	/**
	 * Function: openItemModal
	 *
	 * Description:
	 * Opens the item modal for viewing/editing an item
	 *
	 * @param item - The item to display
	 * @param from - Whether the action originated from cart or menu
	 * @param mods - Existing modifications (for editing)
	 * @param customTxt - Custom text (for editing)
	 * @param quantity - Current quantity (for editing)
	 */
	const openItemModal = (item: Item, from: "cart" | "list", mods?: ModificationOption[], customTxt?: string, quantity: number = 1) => {
		const index = cartItems.findIndex((i) => i.itemId === item.id && (i.customText || "") === (customTxt || "") && areModsEqual(i.modifications, mods));

		setItemLocation(from);
		setSelectedItem(item);
		setSelectedMods(mods && item.modifications ? convertModsToSelectedMods(mods, item.modifications) : {});
		setCustomText(customTxt);
		setEditingIndex(index !== -1 ? index : null);
		setEditingQuantity(quantity);
		setItemModalOpen(true);
	};

	/**
	 * Function: addOrEditCartItem
	 *
	 * Description:
	 * Adds or updates an item in the shopping cart
	 *
	 * @param item - The item to add/update
	 * @param quantity - Desired quantity
	 * @param selectedMods - Selected modifications
	 * @param customText - Custom text for the item
	 */
	const addOrEditCartItem = (item: Item, quantity: number, selectedMods: SelectedMods, customText?: string) => {
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
				customText: customText || "",
			};

			if (editingIndex !== null) {
				const updated = [...prev];
				const existingIndex = updated.findIndex(
					(cartItem) =>
						cartItem.itemId === item.id && (cartItem.customText || "") === (customText || "") && areModsEqual(cartItem.modifications || [], mods)
				);

				if (existingIndex !== -1) {
					if (itemLocation === "cart") {
						const newQuantity = updated[existingIndex].quantity + quantity;
						updated[existingIndex].quantity = newQuantity;

						if (existingIndex !== editingIndex) {
							updated.splice(editingIndex, 1);
						}
					} else if (itemLocation === "list") {
						updated[existingIndex].quantity += quantity;
					}
				} else {
					if (itemLocation == "cart") {
						if (editingIndex !== null && updated[editingIndex]) {
							updated[editingIndex] = newItem;
						} else {
							updated.push(newItem);
						}
					} else if (itemLocation == "list") {
						updated.push(newItem);
					}
				}
				return updated;
			} else {
				const existingIndex = prev.findIndex(
					(cartItem) =>
						cartItem.itemId === item.id && (cartItem.customText || "") === (customText || "") && areModsEqual(cartItem.modifications || [], mods)
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
	};

	// Filter items based on search query
	const lowerSearch = searchQuery.toLowerCase().trim();

	return (
		<>
			{/* Item Modal for viewing/editing items */}
			<ItemModal
				item={selectedItem}
				isOpen={isItemModalOpen}
				onClose={() => {
					setItemModalOpen(false);
					setEditingIndex(null);
				}}
				initialSelectedMods={selectedMods}
				initialCustomText={customText}
				initialQuantity={editingQuantity}
				isEditing={editingIndex !== null}
				onAddToCart={addOrEditCartItem}
			/>

			{/* Checkout Modal for payment processing */}
			<CheckoutModal
				isOpen={isCheckoutOpen}
				onClose={() => {
					setIsCheckoutOpen(false);
					setIsCheckingOut(false);
				}}
				restaurantId={restaurantData._id}
				cartItems={cartItems}
				stripePromise={stripePromise}
			/>

			{/* Main Layout Grid */}
			<div className="w-screen min-h-screen bg-gray-100 grid grid-cols-[2fr_6fr]">
				{/* Sidebar Column */}
				<div className="row-span-full bg-(--color-gray) relative border-r-2 border-black flex flex-col py-10 px-4">
					<h1 className="text-3xl font-semibold text-(--color-ice-blue) text-center">{restaurantData.name}</h1>
					<div className="w-[70%] border-t-2 border-(--color-white) mx-auto my-4 py-10" />

					{/* Category Navigation */}
					<SidebarSection restaurantData={restaurantData} onCategoryClick={scrollToCategory} currentCategory={currentCategory} />

					{/* Shopping Cart Section */}
					<div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[90%] flex flex-col items-center space-y-2">
						<p className="text-xl font-bold text-left mb-2 text-(--color-white)">
							Your Order: <span className="text-sm font-medium">(click to edit)</span>
						</p>
						<div className="w-[90%] border-t-2 border-[--color-white] mx-auto mb-2" />

						{/* Cart Items List */}
						<ul className="h-40 overflow-y-auto pr-1 flex flex-col gap-3 custom-scrollbar w-full px-2">
							{cartItems.map((item) => {
								const fullItem = restaurantData.items.find((i) => i.id === item.itemId);
								return (
									<li
										key={`${item.itemId}-${item.customText || ""}-${item.modifications?.map((m) => m.id).join(",")}`}
										className="w-full px-2 py-1 cursor-pointer rounded bg-(--color-ice-blue)"
										onClick={() => fullItem && openItemModal(fullItem, "cart", item.modifications, item.customText, item.quantity)}>
										<div className="flex justify-between items-center">
											<div className="flex items-center gap-2">
												<button
													onClick={(e) => {
														e.stopPropagation();
														updateQuantity(item.itemId, -1);
													}}
													className="qty-btn">
													–
												</button>
												<span className="w-6 text-center">{item.quantity}</span>
												<button
													onClick={(e) => {
														e.stopPropagation();
														updateQuantity(item.itemId, 1);
													}}
													className="qty-btn">
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

						{/* Cart Summary and Checkout */}
						<div className="w-full px-2 sticky bottom-0 bg-(--color-gray) pt-4 pb-6 mt-2">
							<div className="flex justify-between items-center mb-2">
								<p className="text-xl font-bold text-(--color-white)">Cart Total:</p>
								<p className="text-2xl font-black text-(--color-white)">${cartTotal.toFixed(2)}</p>
							</div>
							<button
								className="bg-(--color-ice-blue) text-black px-6 py-3 rounded-4xl font-semibold hover:bg-(--color-steel-blue) hover:text-(--color-white) transition w-full disabled:opacity-50 disabled:cursor-not-allowed"
								onClick={() => {
									if (cartItems.length === 0) return;

									setIsCheckingOut(true);
									setIsCheckoutOpen(true);
								}}
								disabled={isCheckingOut || cartItems.length === 0}>
								{isCheckingOut ? "Checking out..." : "Go To Checkout"}
							</button>
						</div>
					</div>
				</div>

				{/* Main Content Column */}
				<div className="col-start-2 flex flex-col gap-6 px-6 max-w-[1300px] mx-auto w-full">
					{/* Header with search */}
					<HeaderSection
						registerOpen={!session?.user.onboarded}
						user={session?.user ?? null}
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
					/>

					{/* Menu Items Grid */}
					<div ref={scrollContainerRef} className="overflow-y-auto max-h-[calc(100vh-220px)] space-y-8 px-2 custom-scrollbar">
						{restaurantData.categories.map((category) => {
							const items = restaurantData.items.filter(
								(item) => item.categoryId === category.id && item.name.toLowerCase().includes(lowerSearch)
							);

							if (items.length === 0) return null;

							return (
								<div
									key={category.id}
									ref={(el) => {
										sectionRefs.current[category.id] = el;
									}}
									id={category.id}
									className="opacity-0 animate-fadeIn">
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

			{/* Global Footer */}
			<div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 text-gray-600 text-sm select-none">
				Powered by SwiftPOS |{" "}
				<Link href="/" className="underline">
					Go Back Home
				</Link>
			</div>
		</>
	);
}

/**
 * Testing Notes:
 * - Verify all menu categories and items render correctly
 * - Test category scrolling and active state tracking
 * - Validate search functionality filters items properly
 * - Check cart operations:
 *   - Adding items with/without modifications
 *   - Editing existing items
 *   - Quantity adjustments
 *   - Total price calculations
 * - Test checkout flow initiation
 * - Verify responsive behavior at different screen sizes
 */
