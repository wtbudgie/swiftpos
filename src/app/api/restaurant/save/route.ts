/**
 * File: updateRestaurant.ts
 * Description: API route to update a restaurant in the SwiftPOS database.
 *              Accepts a restaurant ID and update data, validates input, and applies the changes in MongoDB.
 * Author: William Anderson
 */

import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import client from "@/utils/db";

/**
 * Handles a POST request to update a restaurant's data in MongoDB.
 *
 * @param {NextRequest} req - The incoming request object containing JSON with a restaurantId and update fields.
 * @returns {Promise<NextResponse>} JSON response indicating success or failure.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
	try {
		const body = await req.json();

		const { restaurantId, ...updateData } = body;

		// Validate presence and type of restaurantId
		if (!restaurantId || typeof restaurantId !== "string") {
			return NextResponse.json({ error: "restaurantId is required and must be a string" }, { status: 400 });
		}

		// Validate restaurantId format
		let objectId: ObjectId;
		try {
			objectId = new ObjectId(restaurantId);
		} catch {
			return NextResponse.json({ error: "Invalid restaurantId format" }, { status: 400 });
		}

		// Validate that there is something to update
		if (Object.keys(updateData).length === 0) {
			return NextResponse.json({ error: "No update data provided" }, { status: 400 });
		}

		// Connect to the database and locate the restaurants collection
		const db = client.db("SwiftPOS");
		const collection = db.collection("restaurants");

		// Attempt to update the restaurant document
		const result = await collection.updateOne({ _id: objectId }, { $set: updateData });

		// Check if the restaurant was found
		if (result.matchedCount === 0) {
			return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
		}

		// Return success response
		return NextResponse.json(
			{
				success: true,
				message: "Restaurant updated successfully",
				modifiedCount: result.modifiedCount,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Restaurant update failed:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
