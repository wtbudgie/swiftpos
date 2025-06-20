"use client";
import { useState, useEffect } from "react"; // Add useEffect import

import { User } from "next-auth";
import { History, UserCircle } from "lucide-react";

import AccountSettingsModal from "@/components/modals/AccountSettingsModal";
import LoginModal from "@/components/modals/LoginModal";
import RegisterModal from "@/components/modals/RegisterModal";
import OrderHistoryModal from "@/components/modals/OrderHistoryModal";
import { useSearchParams } from "next/navigation";

type HeaderSectionProps = {
	user: User | null;
	registerOpen: boolean;
};

export default function HeaderSection({ user, registerOpen }: HeaderSectionProps) {
	const params = useSearchParams();
	const sessionId = params.get("session_id");

	const [isRegisterOpen, setRegisterOpen] = useState(registerOpen);
	const [isLoginOpen, setLoginOpen] = useState(false);
	const [isSettingsOpen, setSettingsOpen] = useState(false);
	const [isOrderHistoryOpen, setOrderHistoryOpen] = useState(false);

	useEffect(() => {
		if (sessionId) {
			setOrderHistoryOpen(true);
		}
	}, [sessionId]); // Only run when sessionId changes

	return (
		<div className="flex justify-between items-center mb-6">
			<h1 className="text-5xl font-bold text-black">Welcome to SwiftPOS</h1>

			{user && <RegisterModal isOpen={isRegisterOpen} onClose={() => setRegisterOpen(false)} userData={user} />}

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
				<button
					onClick={() => {
						if (!user) return setLoginOpen(true);
						setOrderHistoryOpen(true);
					}}
					className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-300 text-black transition cursor-pointer"
					type="button">
					<History style={{ fontSize: 28, transform: "scale(1.8)" }} />
				</button>
				<button
					className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-300 text-black transition cursor-pointer"
					onClick={() => {
						if (!user) return setLoginOpen(true);
						setSettingsOpen(true);
					}}>
					<UserCircle style={{ fontSize: 28, transform: "scale(1.8)" }} />
				</button>
			</div>
		</div>
	);
}
