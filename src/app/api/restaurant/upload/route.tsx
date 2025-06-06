/**
 * File: uploadImage.ts
 * Description: Server-side API route to handle file uploads (e.g., restaurant images).
 *              Accepts a multipart/form-data request, writes the file to disk, and returns a public URL.
 * Author: William Anderson
 */

import path from "path";
import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

/**
 * Handles a POST request containing a file upload (e.g. image).
 *
 * @param {NextRequest} req - The incoming multipart/form-data request.
 * @returns {Promise<NextResponse>} JSON response with public URL or error message.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
	try {
		const formData = await req.formData();
		const file = formData.get("file") as File;

		// Validate file existence
		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// Optional: Validate MIME type
		/*
		if (!file.type.startsWith("image/")) {
			return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 415 });
		}
		*/

		// Generate unique filename
		const buffer = Buffer.from(await file.arrayBuffer());
		const extension = file.name.split(".").pop() || "dat";
		const filename = `${Date.now()}-${uuidv4()}.${extension}`;
		const filepath = path.join(process.cwd(), "public/images", filename);

		// Write file to disk (inside /public/images)
		await writeFile(filepath, buffer);

		// Return a public-facing URL
		const url = `/images/${filename}`;
		return NextResponse.json({ url }, { status: 201 });
	} catch (error) {
		console.error("File upload error:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
