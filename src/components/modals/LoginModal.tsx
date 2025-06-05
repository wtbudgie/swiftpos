"use client";

import React, { useState } from "react";

import { signIn } from "next-auth/react";
import { usePathname } from "next/navigation";

type LoginModalProps = {
	isOpen: boolean;
	onClose: () => void;
	allowLoginBypass: boolean;
};

export default function LoginModal({ isOpen, onClose, allowLoginBypass }: LoginModalProps) {
	const [email, setEmail] = useState("");
	const [showWarning, setShowWarning] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const pathname = usePathname();

	const handleBackdropClick = () => {
		if (allowLoginBypass) onClose();
		else {
			setShowWarning(true);
			setTimeout(() => setShowWarning(false), 5000);
		}
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			await signIn("email", {
				email,
				redirect: true,
				callbackUrl: pathname,
			});
		} catch (err) {
			console.error(err);
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className={`fixed inset-0 z-[999] grid h-screen w-screen place-items-center
            bg-black/60
            backdrop-blur-sm
            transition-opacity duration-300
			${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
			onClick={handleBackdropClick}>
			<div onClick={(e) => e.stopPropagation()} className="w-full max-w-md mx-4 bg-(--color-white) text-(--color-black) p-6 rounded-lg shadow-lg">
				<form onSubmit={handleLogin} className="flex flex-col items-center gap-6 text-center">
					<h2 className="text-3xl font-bold">Welcome!</h2>
					<p className="text-sm text-(--color-gray)">Enter your email to log in or create an account.</p>

					<div className="w-full">
						<label htmlFor="email" className="block font-semibold text-left text-(--color-black)">
							Email
						</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="w-full rounded border border-(--color-steel-blue) px-3 py-2 text-black"
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-(--color-steel-blue) text-white py-2 rounded hover:bg-(--color-ice-blue) hover:outline hover:text-(--color-black) transition">
						{loading ? "Logging in..." : "Login or Register with Email"}
					</button>

					{error && <p className="text-red-600 font-semibold mt-2">{error}</p>}

					{showWarning && <p className="text-red-600 font-semibold mt-2">Please enter your email to continue.</p>}

					<div className="text-sm text-(--color-black) mt-2 text-center">
						<p>Need help?</p>
						<p className="text-(--color-steel-blue) cursor-pointer hover:underline">Contact support!</p>
					</div>
				</form>
			</div>
		</div>
	);
}
