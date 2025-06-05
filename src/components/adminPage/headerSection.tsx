"use client";
import { User } from "next-auth";
import AccountSettingsModal from "../../common/modals/accountSettingsModal";
import { useState } from "react";
import LoginModal from "../../common/modals/loginModal";
import { CircleUserRound, History, SlidersHorizontal, UserCircle } from "lucide-react";
import RegisterModal from "@/common/modals/registerModal";
import OrderHistoryModal from "@/common/modals/orderHistoryModal";
import SearchBar from "./inputs/searchBar";

type HeaderSectionProps = {
	user: User;
	registerOpen: boolean;
};

export default function headerSection({ user, registerOpen }: HeaderSectionProps) {
	const [isRegisterOpen, setRegisterOpen] = useState(registerOpen);
	const [isLoginOpen, setLoginOpen] = useState(false);
	const [isSettingsOpen, setSettingsOpen] = useState(false);
	const [isOrderHistoryOpen, setOrderHistoryOpen] = useState(false);

	const openSettingsMenu = () => {
		if (!user) return setLoginOpen(true);
		setSettingsOpen(true);
	};

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
					setSettingsOpen(false);
				}}
				userData={user}
			/>
			<OrderHistoryModal
				isOpen={isOrderHistoryOpen}
				onClose={() => {
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
