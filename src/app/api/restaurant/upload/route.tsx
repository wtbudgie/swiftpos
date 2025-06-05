import path from "path";
import { writeFile } from "fs/promises";

import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";

export async function POST(req: NextRequest) {
	const formData = await req.formData();
	const file = formData.get("file") as File;

	if (!file) {
		return NextResponse.json({ error: "No file provided" }, { status: 400 });
	}

	const buffer = Buffer.from(await file.arrayBuffer());
	const ext = file.name.split(".").pop();
	const filename = `${Date.now()}-${v4()}.${ext}`;
	const filepath = path.join(process.cwd(), "public/images", filename);

	await writeFile(filepath, buffer);

	const url = `/images/${filename}`; // Assuming 'public' is static
	return NextResponse.json({ url });
}
