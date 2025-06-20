import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { loadStripe } from "@stripe/stripe-js";
import "./globals.css";

export const metadata: Metadata = {
	title: "SwiftPOS System",
	description: "Easy ordering management system.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`antialiased`}>
				<style>@import url(&quot;https://fonts.googleapis.com/css2?family=Zain:ital,wght@0,300;0,400;0,900;1,300;1,400&display=swap&quot;);</style>
				<SessionProvider>{children}</SessionProvider>
			</body>
		</html>
	);
}
