"use client";
import { User } from "next-auth";
import React from "react";

type AccountSettingsModalProps = {
	isOpen: boolean;
	onClose: () => void;
	userData: User;
};

export default function OrderHistoryModal({ isOpen, onClose, userData }: AccountSettingsModalProps) {
	return (
		<div
			className={`fixed inset-0 z-[999] grid h-screen w-screen place-items-center
            bg-black/60
            backdrop-blur-sm
            transition-opacity duration-300
            ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
			<div className="relative m-4 p-4 w-3/4 rounded-lg bg-white shadow-sm">
				<div className="text-xl font-medium text-slate-800 pb-4">It's a simple modal.</div>
				<div className="border-t border-slate-200 py-4 text-slate-600 font-light">The key to more success is to have a lot of pillows. Fan luv.</div>
				<div className="flex justify-end pt-4">
					<button onClick={onClose} className="rounded-md border py-2 px-4 text-sm text-slate-600 hover:bg-slate-100">
						Cancel
					</button>
					<button onClick={onClose} className="ml-2 rounded-md bg-green-600 py-2 px-4 text-sm text-white hover:bg-green-700">
						Confirm
					</button>
				</div>
			</div>
		</div>
	);
}
