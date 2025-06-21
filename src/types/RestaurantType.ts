import { ObjectId } from "mongodb";
import { ActiveOrder } from "./OrderType";

export type Restaurant = {
	_id?: ObjectId;
	name: string;
	description?: string;
	activeOrders: ActiveOrder[];
	ownerId: string; // User ID of owner
	employeeIds: string[]; // User IDs of employees
	categories: Category[]; // Active categories for grouping items
	items: Item[]; // All menu items
	dietaries: string[];
	address?: string;
	contactEmail?: string;
	phoneNumber?: string;
	imageUrl: string;
};

export type Category = {
	id: string;
	name: string;
	description?: string;
	itemIds: string[]; // IDs of items under this category
};

export type Item = {
	id: string;
	categoryId: string;
	name: string;
	description?: string;
	price: number; // base price for the item
	ingredients: Ingredient[];
	stockAmount?: number | "infinite";
	modifications?: ModificationGroup[];
	dietaries: string[];
	imageUrl?: string;
	isActive: boolean;
};

export type Ingredient = {
	id: string;
	name: string;
	quantity?: string; // e.g. "100g", "2 slices"
};

export type ModificationOption = {
	id: string;
	name: string;
	priceModifier: number; // can be positive or negative for discounts
};

export type ModificationGroup = {
	id: string;
	name: string;
	options: ModificationOption[];
	maxSelectable?: number; // max number of options user can pick
	required?: boolean;
};
