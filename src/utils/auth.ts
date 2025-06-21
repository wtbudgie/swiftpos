/**
 * File: auth.ts
 *
 * Description:
 * NextAuth configuration for SwiftPOS authentication system. Handles:
 * - Email-based authentication
 * - MongoDB user data storage
 * - User creation events
 * - Authentication provider setup
 *
 * Author: William Anderson
 */

import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { ObjectId } from "mongodb";
import client from "./db";
import Email from "next-auth/providers/email";
import { Provider } from "next-auth/providers";

/**
 * Constant: providers
 *
 * Description:
 * Array of authentication providers configured for SwiftPOS.
 * Currently only supports email authentication.
 */
const providers: Provider[] = [
	Email({
		server: process.env.EMAIL_SERVER,
		from: process.env.EMAIL_FROM,
		secret: process.env.AUTH_SECRET,
	}),
];

/**
 * Constant: providerMap
 *
 * Description:
 * Mapped array of provider information used by NextAuth.
 * Filters out the email provider from the displayed list.
 */
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

/**
 * NextAuth Configuration
 *
 * Description:
 * Primary configuration object for NextAuth.js with:
 * - MongoDB adapter for user data storage
 * - Email provider authentication
 * - Custom pages for auth flows
 * - User creation event handler
 */
export const { auth, handlers, signIn, signOut } = NextAuth({
	/**
	 * MongoDB Adapter Configuration
	 *
	 * Uses the MongoDB client connection to store:
	 * - User accounts
	 * - Sessions
	 * - Verification tokens
	 */
	adapter: MongoDBAdapter(client, { databaseName: "SwiftPOS" }),

	/**
	 * Authentication Providers
	 *
	 * Currently configured with email authentication only
	 */
	providers,

	/**
	 * Custom Page Paths
	 *
	 * Defines routes for authentication-related pages:
	 * - signIn: Main authentication page
	 * - newUser: Redirect after first sign in
	 * - verifyRequest: Email verification page
	 */
	pages: {
		signIn: "/",
		newUser: "/",
		verifyRequest: "/auth/verify",
	},

	/**
	 * Authentication Events
	 *
	 * Handles post-user creation initialization
	 */
	events: {
		/**
		 * Event: createUser
		 *
		 * Description:
		 * Initializes new user documents with default values:
		 * - Onboarding status
		 * - Personal information fields
		 * - Empty order history
		 * - Empty restaurant associations
		 */
		async createUser({ user }) {
			const users = client.db("SwiftPOS").collection("users");

			await users.updateOne(
				{ _id: new ObjectId(user.id) },
				{
					$set: {
						onboarded: false,
						firstName: null,
						lastName: null,
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

/**
 * Testing Notes:
 * - Verify email authentication flow works end-to-end
 * - Test new user document initialization
 * - Check MongoDB adapter connection and data storage
 * - Validate all configured pages render correctly
 * - Confirm proper error handling for failed auth attempts
 */
