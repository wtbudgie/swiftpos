/**
 * File: uploadImage.ts
 * Description: Handles image file uploads for SwiftPOS, saving images to the server's public directory and returning accessible URLs.
 * Author: William Anderson
 */

import path from "path";
import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Type: Promise resolving to an object with restaurantId string
type Params = Promise<{ restaurantId: string }>;

/**
 * Function: POST
 * Input:
 * - req: NextRequest — the incoming HTTP POST request containing form data
 * - params: object containing a Params promise resolving to { restaurantId: string }
 *
 * Output:
 * - NextResponse — JSON response with either the image URL (status 201) or error messages (status 400 or 500)
 *
 * Description:
 * Processes an image file upload from a multipart/form-data POST request.
 * Extracts the 'file' field, validates it, generates a unique filename using a timestamp and UUID,
 * saves the file buffer to the server's public images directory, and returns the URL for client use.
 * Handles errors for missing files and internal failures gracefully.
 */
export async function POST(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
	try {
		// Extract form data from the request
		const formData = await req.formData();

		// Retrieve file from form data, cast as File type
		const file = formData.get("file") as File;

		// Validate file existence
		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// Convert file to a buffer for filesystem write
		const buffer = Buffer.from(await file.arrayBuffer());

		// Extract file extension or default to 'dat'
		const extension = file.name.split(".").pop() || "dat";

		// Generate unique filename with timestamp and UUID to avoid collisions
		const filename = `${Date.now()}-${uuidv4()}.${extension}`;

		// Build absolute file path in the public images directory
		const filepath = path.join(process.cwd(), "public/images", filename);

		// Write the file buffer to disk asynchronously
		await writeFile(filepath, buffer);

		// Create relative URL for client access to the uploaded image
		const url = `/images/${filename}`;

		// Respond with the URL and HTTP 201 Created status
		return NextResponse.json({ url }, { status: 201 });
	} catch (error) {
		// Log error details for debugging
		console.error("File upload error:", error);

		// Respond with generic internal server error status and message
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

/**
 * Testing Notes:
 * - Send multipart/form-data POST requests with and without a 'file' field to verify validation.
 * - Confirm files are saved correctly in /public/images with unique names.
 * - Check response status codes and returned JSON for success and error cases.
 */
