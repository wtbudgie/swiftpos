/**
 * File: updateRestaurant.ts
 * Description: API endpoint to update restaurant details in the SwiftPOS database.
 * Author: William Anderson
 * Created: 2025-06-19
 */

import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import client from "@/utils/db";

// Type: Promise resolving to object with restaurantId string
type Params = Promise<{ restaurantId: string }>;

/**
 * Function: POST
 * Input:
 * - req: NextRequest — incoming HTTP POST request with JSON body containing fields to update
 * - params: object containing a Params promise resolving to { restaurantId: string }
 *
 * Output:
 * - NextResponse — JSON response indicating success or failure of update operation with appropriate HTTP status codes
 *
 * Description:
 * Receives update data for a restaurant identified by restaurantId.
 * Validates restaurantId format and presence of update data.
 * Uses MongoDB's updateOne with $set to modify restaurant document fields.
 * Returns error responses if validation fails, restaurant is not found, or on internal errors.
 */
export async function POST(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
	try {
		// Parse JSON body containing update fields
		const body = await req.json();
		const { ...updateData } = body;

		// Await resolved restaurantId string from params
		const { restaurantId } = await params;

		// Validate restaurantId presence and type
		if (!restaurantId || typeof restaurantId !== "string") {
			return NextResponse.json({ error: "restaurantId is required and must be a string" }, { status: 400 });
		}

		// Convert restaurantId string to MongoDB ObjectId, handle invalid format
		let objectId: ObjectId;
		try {
			objectId = new ObjectId(restaurantId);
		} catch {
			return NextResponse.json({ error: "Invalid restaurantId format" }, { status: 400 });
		}

		// Ensure update data is provided to avoid empty updates
		if (Object.keys(updateData).length === 0) {
			return NextResponse.json({ error: "No update data provided" }, { status: 400 });
		}

		// Access the SwiftPOS database and restaurants collection
		const db = client.db("SwiftPOS");
		const collection = db.collection("restaurants");

		// Perform the update operation on the restaurant document
		const result = await collection.updateOne({ _id: objectId }, { $set: updateData });

		// Handle case where no matching restaurant was found
		if (result.matchedCount === 0) {
			return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
		}

		// Return success response with modification count
		return NextResponse.json(
			{
				success: true,
				message: "Restaurant updated successfully",
				modifiedCount: result.modifiedCount,
			},
			{ status: 200 }
		);
	} catch (error) {
		// Log internal errors for debugging
		console.error("Restaurant update failed:", error);

		// Respond with generic internal server error message
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

/**
 * Testing Notes:
 * - Send POST requests with valid and invalid restaurantId formats to verify validation.
 * - Submit update data and confirm correct MongoDB document modification.
 * - Test empty update data payload and verify proper error response.
 * - Attempt updates on non-existent restaurant IDs to confirm 404 response.
 *
 * Future Enhancements:
 * - Add authentication to restrict update access.
 * - Validate updateData fields to prevent invalid or unauthorized changes.
 * - Implement logging of update history for audit purposes.
 */
