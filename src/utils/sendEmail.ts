/**
 * File: sendEmail.ts
 *
 * Description:
 * Email sending utility for SwiftPOS using Nodemailer.
 * Handles system email notifications with proper validation
 * and error handling.
 *
 * Author: William Anderson
 */

import nodemailer from "nodemailer";

/**
 * Function: sendEmail
 *
 * Description:
 * Sends an HTML email using configured Nodemailer transport.
 * Validates all required environment variables before sending.
 *
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param html - HTML content of the email
 *
 * @throws Error - When required environment variables are missing
 * @throws Error - When email transport or sending fails
 *
 * Behavior:
 * 1. Validates all required NODEMAILER_* environment variables
 * 2. Creates secure SMTP transporter
 * 3. Sends HTML email with provided content
 * 4. Includes debug logging for troubleshooting
 */
export const sendEmail = async (to: string, subject: string, html: string) => {
	// Validate required environment variables
	const { NODEMAILER_HOST, NODEMAILER_PORT, NODEMAILER_USER, NODEMAILER_PASSWORD, NODEMAILER_FROM } = process.env;

	if (!NODEMAILER_HOST || !NODEMAILER_PORT || !NODEMAILER_USER || !NODEMAILER_PASSWORD || !NODEMAILER_FROM) {
		throw new Error("❌ Missing one or more NODEMAILER_* environment variables.");
	}

	try {
		// Create SMTP transporter
		const transporter = nodemailer.createTransport({
			host: NODEMAILER_HOST,
			port: Number(NODEMAILER_PORT),
			secure: false, // True for port 465, false for other ports
			auth: {
				user: NODEMAILER_USER,
				pass: decodeURIComponent(NODEMAILER_PASSWORD), // Handles encoded passwords
			},
		});

		// Send email
		await transporter.sendMail({
			from: NODEMAILER_FROM,
			to,
			subject,
			html,
		});

		console.log(`📧 Email successfully sent to ${to}`);
	} catch (error) {
		console.error(`❌ Failed to send email to ${to}:`, error);
		throw new Error(`Email sending failed: ${error instanceof Error ? error.message : String(error)}`);
	}
};

/**
 * Testing Notes:
 * - Verify all required env vars are validated
 * - Test with valid/invalid email addresses
 * - Check HTML content rendering
 * - Verify SMTP connection security
 * - Test with encoded/plain text passwords
 * - Validate error handling for:
 *   - Network failures
 *   - Authentication failures
 *   - Invalid email formats
 */
