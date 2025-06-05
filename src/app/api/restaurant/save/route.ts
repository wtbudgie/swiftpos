import { NextRequest, NextResponse } from "next/server";
import client from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		const { restaurantId, ...updateData } = body;

		if (!restaurantId || typeof restaurantId !== "string") {
			return NextResponse.json({ error: "restaurantId is required and must be a string" }, { status: 400 });
		}

		const db = client.db("SwiftPOS");
		const collection = db.collection("restaurants");

		const result = await collection.updateOne({ _id: new ObjectId(restaurantId) }, { $set: updateData });

		if (result.matchedCount === 0) {
			return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, modifiedCount: result.modifiedCount }, { status: 200 });
	} catch (error) {
		console.error("Save failed:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
