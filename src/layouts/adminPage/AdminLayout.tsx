/**
 * File: AdminLayout.tsx
 * Description:
 * Main layout component for SwiftPOS admin interface. Handles navigation between
 * different admin sections and renders the appropriate content panel based on
 * the currently selected section.
 * Author: William Anderson
 */

"use client";

import { useState } from "react";
import { Session } from "next-auth";
import Link from "next/link";

import ActiveOrdersList from "./pages/ActiveOrders";
import EditMenuSection from "./pages/EditMenu";
import HeaderSection from "./sections/HeaderSection";
import SidebarSection from "./sections/SidebarSection";
import { SanitizedRestaurant } from "@/app/restaurant/[restaurantId]/admin/page";
import SalesStatsPage from "./pages/SalesStats";
import PastOrdersListPage from "./pages/PastOrders";
import EditStorePage from "./pages/EditSettings";

/**
 * Type: AdminLayoutProps
 *
 * Properties:
 * - restaurantData: SanitizedRestaurant — contains all restaurant information
 * - session: Session — user authentication session data
 */
type AdminLayoutProps = {
	restaurantData: SanitizedRestaurant;
	session: Session;
};

/**
 * Component: AdminLayout
 *
 * Props:
 * - restaurantData: SanitizedRestaurant
 * - session: Session
 *
 * Description:
 * Provides the main scaffold for the admin dashboard, including:
 * - Persistent sidebar navigation
 * - Dynamic content area that switches between admin sections
 * - Global header with user controls
 * - Footer with system information
 *
 * Behavior:
 * - Maintains state for the currently active section
 * - Conditionally renders content panels based on active section
 * - Provides navigation back to public restaurant view
 */
export default function AdminLayout({ restaurantData, session }: AdminLayoutProps) {
	// Tracks which admin section is currently being viewed
	const [activeSection, setActiveSection] = useState<string>("activeOrders");

	return (
		<>
			{/* Main grid layout with sidebar and content area */}
			<div className="w-screen min-h-screen bg-gray-100 grid grid-cols-[2fr_6fr]">
				{/* Sidebar Section */}
				<div className="row-span-full bg-(--color-gray) relative border-r-2 border-black flex flex-col py-10 px-4">
					{/* Restaurant Title - Shows the restaurant name from props */}
					<h1 className="text-3xl font-semibold decoration-[2px] text-(--color-ice-blue) text-center">{restaurantData?.name || "Restaurant"}</h1>

					{/* Decorative divider */}
					<div className="w-[70%] border-t-2 border-(--color-white) mx-auto mb-6 mt-4" />

					{/* Navigation sidebar component */}
					<SidebarSection onCategoryClick={setActiveSection} activeSection={activeSection} />

					{/* Fixed-position link to public restaurant view */}
					<div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[90%] flex flex-col items-center space-y-2 ">
						<Link
							className="relative bg-(--color-ice-blue) text-black px-6 py-3 rounded-4xl font-semibold hover:bg-(--color-steel-blue) hover:text-(--color-white) transition w-[70%] cursor-pointer text-center"
							href={`/restaurant/${restaurantData._id}`}>
							Go To Restaurant
						</Link>
					</div>
				</div>

				{/* Main Content Area */}
				<div className="col-start-2 flex flex-col gap-0 px-6 pb-10 max-w-[1300px] mx-auto w-full">
					{/* Header with user controls and search */}
					<HeaderSection registerOpen={!session?.user.onboarded} user={session?.user} searchDisabled={activeSection !== "menuSettings"} />

					{/* Dynamic content section rendering */}
					{activeSection === "activeOrders" && <ActiveOrdersList restaurantData={restaurantData} />}
					{activeSection === "pastOrders" && <PastOrdersListPage restaurantData={restaurantData} />}
					{activeSection === "menuSettings" && <EditMenuSection restaurantData={restaurantData} />}
					{activeSection === "storeSettings" && <EditStorePage restaurantData={restaurantData} />}
					{activeSection === "salesStatistics" && <SalesStatsPage />}
				</div>
			</div>

			{/* Global Footer */}
			<div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 text-gray-600 text-sm select-none">
				Powered by SwiftPOS{" | "}
				<Link href="/" className="pointer-events-auto underline">
					Go Back Home
				</Link>
			</div>
		</>
	);
}

/**
 * Testing Notes:
 * - Verify all admin sections render correctly when selected
 * - Test sidebar navigation updates active section state
 * - Check header displays correct user information
 * - Confirm "Go To Restaurant" link navigates properly
 * - Validate responsive behavior at different screen sizes
 * - Test conditional search availability in menuSettings
 */
