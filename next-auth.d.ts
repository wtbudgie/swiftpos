// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
	interface User {
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
	}

	interface Session {
		user: {
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
		} & DefaultSession["user"];
	}
}
