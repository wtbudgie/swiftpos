/**
 * File: VerifyRequestPage.tsx
 * Description: UI component shown after a user initiates sign-in with email.
 *              It instructs the user to check their email for a sign-in link.
 * Author: William Anderson
 */

export default function VerifyRequestPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
			<div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 text-center border border-gray-300">
				<h1 className="text-2xl font-bold text-black mb-2">Check your email</h1>
				<p className="text-gray-700 mb-6">A sign-in link has been sent to your email address.</p>
				<p className="text-gray-500 text-sm italic">This page can now be closed.</p>
			</div>
		</div>
	);
}
