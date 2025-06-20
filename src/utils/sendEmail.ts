import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, html: string) => {
	// Validate required env variables
	const { NODEMAILER_HOST, NODEMAILER_PORT, NODEMAILER_USER, NODEMAILER_PASSWORD, NODEMAILER_FROM } = process.env;

	if (!NODEMAILER_HOST || !NODEMAILER_PORT || !NODEMAILER_USER || !NODEMAILER_PASSWORD || !NODEMAILER_FROM) {
		throw new Error("❌ Missing one or more NODEMAILER_* environment variables.");
	}

	console.log("Creating transporter with:", {
		host: NODEMAILER_HOST,
		port: NODEMAILER_PORT,
		user: NODEMAILER_USER,
	});

	const transporter = nodemailer.createTransport({
		host: NODEMAILER_HOST,
		port: Number(NODEMAILER_PORT),
		secure: false,
		auth: {
			user: NODEMAILER_USER,
			pass: decodeURIComponent(NODEMAILER_PASSWORD),
		},
	});

	await transporter.sendMail({
		from: NODEMAILER_FROM,
		to,
		subject,
		html,
	});
};
