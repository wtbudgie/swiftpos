"use client";
import { useState } from "react";

import { User } from "next-auth";
import { CircleUserRound, History, SlidersHorizontal } from "lucide-react";

import AccountSettingsModal from "@/components/modals/AccountSettingsModal";
import LoginModal from "@/components/modals/LoginModal";
import OrderHistoryModal from "@/components/modals/OrderHistoryModal";
import RegisterModal from "@/components/modals/RegisterModal";

import SearchBar from "@/components/inputs/SearchBar";
import { OrderedItem } from "@/types/OrderType";

type HeaderSectionProps = {
	user: User | null;
	registerOpen: boolean;
	searchQuery: string;
	setSearchQuery: (value: string) => void;
};

export default function HeaderSection({ user, registerOpen, searchQuery, setSearchQuery }: HeaderSectionProps) {
	const [isRegisterOpen, setRegisterOpen] = useState(registerOpen);
	const [isLoginOpen, setLoginOpen] = useState(!user);
	const [isSettingsOpen, setSettingsOpen] = useState(false);
	const [isOrderHistoryOpen, setOrderHistoryOpen] = useState(false);

	return (
		<div className="bg-transparent p-6 rounded-md">
			{user && (
				<RegisterModal
					isOpen={isRegisterOpen}
					onClose={() => {
						setRegisterOpen(false);
					}}
					userData={user}
				/>
			)}
			<LoginModal
				isOpen={isLoginOpen}
				onClose={() => {
					setLoginOpen(false);
				}}
				allowLoginBypass={true}
			/>
			{user && (
				<AccountSettingsModal
					isOpen={isSettingsOpen}
					onClose={() => {
						setSettingsOpen(false);
					}}
					userData={user}
				/>
			)}

			{user && (
				<OrderHistoryModal
					isOpen={isOrderHistoryOpen}
					onClose={() => {
						setOrderHistoryOpen(false);
					}}
					userData={user}
				/>
			)}

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

				{/* Search bar fills remaining space */}
				<div className="flex-1 ml-4">
					<SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
				</div>
			</div>
		</div>
	);
}
