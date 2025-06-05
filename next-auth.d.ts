// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
	interface User {
		id: string;
		email: string;
		emailVerified: string | null;
		firstName: string;
		secondName: string;
		phoneNumber: string;
		onboarded: boolean;
		ownerOf: string[];
		employeeOf: string[];
		pastOrders: string[];
	}

	interface Session {
		user: {
			id: string;
			email: string;
			emailVerified: string | null;
			firstName: string;
			secondName: string;
			postcode: string | null;
			state: string;
			onboarded: boolean;
			ownerOf: string[];
			employeeOf: string[];
			pastOrders: string[];
		} & DefaultSession["user"];
	}
}
