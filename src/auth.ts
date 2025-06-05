import NextAuth from "next-auth";

import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { ObjectId } from "mongodb";
import client from "./lib/db";

import Email from "next-auth/providers/email";
import { Provider } from "next-auth/providers";

const providers: Provider[] = [
	Email({
		server: process.env.EMAIL_SERVER,
		from: process.env.EMAIL_FROM,
		secret: process.env.AUTH_SECRET,
	}),
];

export const providerMap = providers
	.map((provider) => {
		if (typeof provider === "function") {
			const providerData = provider();
			return { id: providerData.id, name: providerData.name };
		} else {
			return { id: provider.id, name: provider.name };
		}
	})
	.filter((provider) => provider.id !== "email");

export const { auth, handlers, signIn, signOut } = NextAuth({
	adapter: MongoDBAdapter(client, { databaseName: "SwiftPOS" }),
	providers,
	pages: {
		signIn: "/",
		newUser: "/",
		verifyRequest: "/auth/verify",
	},
	events: {
		async createUser({ user }) {
			const users = client.db("SwiftPOS").collection("users");

			await users.updateOne(
				{ _id: new ObjectId(user.id) },
				{
					$set: {
						onboarded: false,
						firstName: null,
						secondName: null,
						phoneNumber: null,
						pastOrders: [],
						ownerOf: [],
						employeeOf: [],
					},
				}
			);
		},
	},
});
