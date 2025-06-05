"use client";
import { User } from "next-auth";
import AccountSettingsModal from "../../common/modals/accountSettingsModal";
import { useState } from "react";
import LoginModal from "../../common/modals/loginModal";
import { History, UserCircle } from "lucide-react";
import RegisterModal from "@/common/modals/registerModal";
import OrderHistoryModal from "@/common/modals/orderHistoryModal";

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
		<div className="flex justify-between items-center mb-6">
			<h1 className="text-5xl font-bold text-black">Welcome to SwiftPOS</h1>

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
				<button
					onClick={() => setOrderHistoryOpen(true)}
					className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-300 text-black transition cursor-pointer"
					type="button">
					<History style={{ fontSize: 28, transform: "scale(1.8)" }} />
				</button>
				<button
					className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-300 text-black transition cursor-pointer"
					onClick={openSettingsMenu}>
					<UserCircle style={{ fontSize: 28, transform: "scale(1.8)" }} />
				</button>
			</div>
		</div>
	);
}
