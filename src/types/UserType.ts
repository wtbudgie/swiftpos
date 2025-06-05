// UserType.ts
import { ObjectId } from "mongodb";
import { UserOrderReceipt } from "./OrderType";

export type User = {
	_id: ObjectId;
	emailVerified: string;
	email: string;
	phoneNumber: string;
	employeeOf: string[];
	firstName: string | null;
	secondName: string | null;
	onboarded: boolean;
	ownerOf: string[]; // array of restaurant IDs the user owns
	pastOrders: UserOrderReceipt[]; // user’s past orders (receipts)
};
