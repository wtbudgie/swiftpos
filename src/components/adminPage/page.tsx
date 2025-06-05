"use client";

import SidebarSection from "./sidebarSection";
import HeaderSection from "@/components/restaurantPage/headerSection";
import { Session } from "next-auth";
import Link from "next/link";
import EditMenuSection from "./pages/editMenu";
import { SanitizedRestaurant } from "@/app/restaurant/[restaurantId]/admin/page";
import ActiveOrdersList from "./pages/activeOrders";
import { useState } from "react";

type PageProps = {
	restaurantData: SanitizedRestaurant;
	session: Session;
};

export default function PageSection({ restaurantData, session }: PageProps) {
	let loggedIn = false;
	if (session?.user) loggedIn = true;

	const [activeSection, setActiveSection] = useState<string>("menuSettings");

	const openPage = (categoryId: string) => {
		setActiveSection(categoryId);
	};

	return (
		<>
			<div className="w-screen min-h-screen bg-gray-100 grid grid-cols-[2fr_6fr]">
				{/* Sidebar */}
				<div className="row-span-full bg-(--color-gray) relative border-r-2 border-black flex flex-col py-10 px-4">
					{/* Restaurant Title */}
					<h1 className="text-3xl font-semibold decoration-[2px] text-(--color-ice-blue) text-center">{restaurantData?.name || "Restaurant"}</h1>
					<div className="w-[70%] border-t-2 border-(--color-white) mx-auto mb-6 mt-4" />
					<SidebarSection onCategoryClick={openPage} />

					<div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[90%] flex flex-col items-center space-y-2 ">
						<Link
							className="relative bg-(--color-ice-blue) text-black px-6 py-3 rounded-4xl font-semibold hover:bg-(--color-steel-blue) hover:text-(--color-white) transition w-[70%] cursor-pointer text-center"
							href={`/restaurant/${restaurantData._id}`}>
							Go To Restaurant
						</Link>
					</div>
				</div>

				{/* Main Content */}
				<div className="col-start-2 flex flex-col gap-0 px-6 pb-10 max-w-[1300px] mx-auto w-full">
					{/* Header section */}
					<HeaderSection registerOpen={!session?.user.onboarded} user={session?.user!} />
					{activeSection === "menuSettings" && <EditMenuSection restaurantData={restaurantData} />}
					{activeSection === "activeOrders" && <ActiveOrdersList restaurantData={restaurantData} />}
				</div>
			</div>

			{/* Footer */}
			<div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 text-gray-600 text-sm select-none">
				Powered by SwiftPOS{" | "}
				<Link href="/" className="pointer-events-auto underline">
					Go Back Home
				</Link>
			</div>
		</>
	);
}
