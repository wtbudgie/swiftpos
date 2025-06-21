/**
 * File: db.ts
 *
 * Description:
 * MongoDB client configuration and initialization for SwiftPOS.
 * Establishes a connection to MongoDB using environment variables
 * and provides a reusable client instance throughout the application.
 *
 * Author: William Anderson
 */

import { MongoClient, ServerApiVersion } from "mongodb";

/**
 * Environment Validation:
 * Ensures the required MongoDB connection URI is properly configured
 * before attempting to establish a connection.
 */
if (!process.env.MONGODB_URI) {
	throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

/**
 * Constant: uri
 *
 * Description:
 * MongoDB connection string loaded from environment variables.
 * Contains authentication credentials and connection parameters.
 */
const uri = process.env.MONGODB_URI;

/**
 * Constant: options
 *
 * Description:
 * MongoDB driver configuration options including:
 * - Server API versioning
 * - Strict mode enforcement
 * - Deprecation error handling
 */
const options = {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
};

/**
 * Constant: client
 *
 * Description:
 * MongoDB client instance configured with:
 * - Connection URI
 * - API versioning options
 *
 * Usage:
 * Import this client throughout the application to interact with MongoDB
 * while maintaining a single connection pool.
 */
const client = new MongoClient(uri, options);

export default client;

/**
 * Testing Notes:
 * - Verify connection succeeds with valid MONGODB_URI
 * - Test connection failure handling
 * - Validate API version compatibility
 * - Check connection pooling behavior
 * - Monitor memory leaks with long-running connections
 */
