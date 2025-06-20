import { ModificationOption } from "./RestaurantType";

export enum OrderStatus {
	Pending = "pending",
	Preparing = "preparing",
	Ready = "ready",
	Completed = "completed",
}

export type ActiveOrder = {
	id: string;
	customerId?: string;
	orderPlacedAt: string;
	status: OrderStatus;
	items: OrderedItem[];
	discountAmount: number;
	discountPrice: number;
	actualPrice: number;
	notes?: string;
	paymentIntentId: string;
};

export type OrderedItem = {
	itemId: string;
	name: string;
	quantity: number;
	basePrice: number;
	modifications?: ModificationOption[];
	customText: string;
	totalPrice: number;
};

export type UserOrderReceipt = {
	id: string;
	restaurantId: string;
	restaurantName: string;
	orderPlacedAt: string;
	items: {
		name: string;
		quantity: number;
		totalPrice: number;
	}[];
	discountAmount: number;
	discountPrice: number;
	actualPrice: number;
	status: OrderStatus;
};
