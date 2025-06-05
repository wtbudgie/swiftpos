"use client";
import { useState } from "react";

import { User } from "next-auth";
import { CircleUserRound, History, SlidersHorizontal } from "lucide-react";

import AccountSettingsModal from "@/components/modals/AccountSettingsModal";
import LoginModal from "@/components/modals/LoginModal";
import OrderHistoryModal from "@/components/modals/OrderHistoryModal";
import RegisterModal from "@/components/modals/RegisterModal";

import SearchBar from "@/components/inputs/SearchBar";

type HeaderSectionProps = {
	user: User;
	registerOpen: boolean;
};

export default function HeaderSection({ user, registerOpen }: HeaderSectionProps) {
	const [isRegisterOpen, setRegisterOpen] = useState(registerOpen);
	const [isLoginOpen, setLoginOpen] = useState(false);
	const [isSettingsOpen, setSettingsOpen] = useState(false);
	const [isOrderHistoryOpen, setOrderHistoryOpen] = useState(false);

	return (
		<div className="bg-transparent p-6 rounded-md">
			<RegisterModal
				isOpen={isRegisterOpen}
				onClose={() => {
					setRegisterOpen(false);
				}}
				userData={user}
			/>
			<LoginModal
				isOpen={isLoginOpen}
				onClose={() => {
					setLoginOpen(false);
				}}
				allowLoginBypass={true}
			/>
			<AccountSettingsModal
				isOpen={isSettingsOpen}
				onClose={() => {
					console.log("Closing Account Settings Modal");
					setSettingsOpen(false);
				}}
				userData={user}
			/>
			<OrderHistoryModal
				isOpen={isOrderHistoryOpen}
				onClose={() => {
					console.log("Closing Account Settings Modal");
					setOrderHistoryOpen(false);
				}}
				userData={user}
			/>

			<div className="flex items-center gap-2">
				{/* Buttons all on the left */}
				<button
					onClick={() => setSettingsOpen(true)}
					className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-300 text-black transition"
					type="button">
					<CircleUserRound />
				</button>
				<button
					onClick={() => setOrderHistoryOpen(true)}
					className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-300 text-black transition"
					type="button">
					<History />
				</button>
				<button className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-300 text-black transition">
					<SlidersHorizontal />
				</button>

				{/* Search bar fills remaining space */}
				<div className="flex-1 ml-4">
					<SearchBar />
				</div>
			</div>
		</div>
	);
}
