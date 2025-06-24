/**
 * File: RootLayout.tsx
 * Description: Root layout component for SwiftPOS, wrapping the app with global styles and session context.
 * Author: William Anderson
 */

import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

/**
 * Metadata for the application, used by Next.js for SEO and page settings.
 * - title: string — The site title shown in the browser tab.
 * - description: string — Brief description for SEO.
 */
export const metadata: Metadata = {
	title: "SwiftPOS System",
	description: "Easy ordering management system.",
};

/**
 * RootLayout component wraps the entire app.
 *
 * Input:
 * - children: React.ReactNode — Nested React components representing the page content.
 *
 * Output:
 * - JSX.Element — Returns the full HTML layout with language set to English.
 *
 * Description:
 * This component:
 * - Sets the HTML lang attribute to "en" for accessibility and SEO.
 * - Applies global CSS styles imported from "globals.css".
 * - Injects a Google Font stylesheet for consistent typography.
 * - Wraps the app in the NextAuth SessionProvider to enable session management across all pages.
 */
export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`antialiased`}>
				<SessionProvider>{children}</SessionProvider>
			</body>
		</html>
	);
}
