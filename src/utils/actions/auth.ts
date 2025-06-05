"use server";

import { signIn, signOut } from "@/utils/auth";

export const login = async () => {
	await signIn("nodemailer", { redirectTo: "/" });
};

export const logout = async () => {
	await signOut({ redirectTo: "/" });
};
