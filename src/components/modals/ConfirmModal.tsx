"use client";

import React from "react";

type ConfirmModalProps = {
	isOpen: boolean;
	title?: string;
	message?: string;
	onCancel: () => void;
	onConfirm: () => void;
};

export default function ConfirmModal({ isOpen, title = "Are you sure?", message = "This action cannot be undone.", onCancel, onConfirm }: ConfirmModalProps) {
	return (
		<div
			className={`fixed inset-0 z-[999] grid place-items-center
				bg-black/60 backdrop-blur-sm
				transition-opacity duration-300
				${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
			<div className="relative m-4 p-4 w-[90%] max-w-md rounded-lg bg-white shadow-lg">
				<div className="text-xl font-semibold text-slate-800 pb-2">{title}</div>
				<div className="text-sm text-slate-600 font-light pb-4">{message}</div>
				<div className="flex justify-end gap-2 pt-2">
					<button onClick={onCancel} className="rounded-md border py-2 px-4 text-sm text-slate-600 hover:bg-slate-100">
						Cancel
					</button>
					<button onClick={onConfirm} className="rounded-md bg-red-600 py-2 px-4 text-sm text-white hover:bg-red-700">
						Delete
					</button>
				</div>
			</div>
		</div>
	);
}
