/**
 * File: auth-actions.ts
 *
 * Description:
 * Server actions for handling authentication flows in SwiftPOS.
 * Provides simple wrappers around NextAuth's signIn/signOut functionality
 * with predefined configurations for the application.
 *
 * Author: William Anderson
 */

"use server";

import { signIn, signOut } from "@/utils/auth";

/**
 * Action: login
 *
 * Description:
 * Initiates the authentication flow using the nodemailer provider.
 * Automatically redirects to the home page after successful authentication.
 *
 * Behavior:
 * - Uses email-based authentication
 * - Maintains session via NextAuth
 * - Handles all authentication errors internally
 */
export const login = async () => {
	await signIn("nodemailer", { redirectTo: "/" });
};

/**
 * Action: logout
 *
 * Description:
 * Terminates the current user session and clears authentication state.
 * Redirects to the home page after successful sign out.
 *
 * Behavior:
 * - Invalidates the session cookie
 * - Clears any authentication tokens
 * - Ensures clean session termination
 */
export const logout = async () => {
	await signOut({ redirectTo: "/" });
};

/**
 * Testing Notes:
 * - Verify login action initiates proper authentication flow
 * - Test logout action correctly terminates sessions
 * - Check redirect behavior after auth operations
 * - Validate error cases (network issues, invalid credentials)
 * - Confirm session persistence across routes
 */
