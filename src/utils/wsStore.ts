/**
 * File: wsStore.ts
 *
 * Description:
 * WebSocket connection manager for SwiftPOS real-time updates.
 * Maintains active WebSocket connections per restaurant and provides
 * methods for connection management and message broadcasting.
 */

import type WebSocket from "ws";

/**
 * Constant: restaurantClients
 *
 * Description:
 * Map storing active WebSocket connections organized by restaurant ID.
 * Uses Set to ensure unique connections per restaurant.
 */
const restaurantClients = new Map<string, Set<WebSocket>>();

/**
 * Function: addClient
 *
 * Description:
 * Registers a new WebSocket client for a specific restaurant.
 *
 * @param restaurantId - ID of the restaurant the client belongs to
 * @param client - WebSocket connection instance
 *
 * Behavior:
 * - Creates new Set if no clients exist for the restaurant
 * - Adds client to the restaurant's connection Set
 * - Logs connection count for monitoring
 */
export function addClient(restaurantId: string, client: WebSocket) {
	if (!restaurantClients.has(restaurantId)) {
		restaurantClients.set(restaurantId, new Set());
	}
	restaurantClients.get(restaurantId)!.add(client);
	console.log(`[wsStore] Added client for ${restaurantId}. Total clients: ${restaurantClients.get(restaurantId)!.size}`);
}

/**
 * Function: removeClient
 *
 * Description:
 * Removes a WebSocket client from a restaurant's connection pool.
 *
 * @param restaurantId - ID of the restaurant the client belongs to
 * @param client - WebSocket connection instance to remove
 *
 * Behavior:
 * - Removes client from the Set if found
 * - Cleans up empty Sets to prevent memory leaks
 * - Logs remaining connection count
 */
export function removeClient(restaurantId: string, client: WebSocket) {
	const clients = restaurantClients.get(restaurantId);
	if (clients) {
		clients.delete(client);
		if (clients.size === 0) {
			restaurantClients.delete(restaurantId);
		}
		console.log(`[wsStore] Removed client for ${restaurantId}. Remaining clients: ${clients.size}`);
	}
}

/**
 * Function: getClients
 *
 * Description:
 * Retrieves all active WebSocket connections for a restaurant.
 *
 * @param restaurantId - ID of the restaurant to query
 * @returns Set<WebSocket> - Active connections (empty Set if none)
 */
export function getClients(restaurantId: string): Set<WebSocket> {
	return restaurantClients.get(restaurantId) || new Set();
}

/**
 * Function: broadcastToRestaurant
 *
 * Description:
 * Sends a message to all connected clients of a specific restaurant.
 *
 * @param restaurantId - Target restaurant ID
 * @param message - Data to broadcast (will be stringified)
 *
 * Behavior:
 * - Only sends to clients with OPEN connection state
 * - Handles JSON serialization automatically
 * - Logs broadcast metrics for monitoring
 */
export function broadcastToRestaurant(restaurantId: string, message: unknown) {
	const clients = restaurantClients.get(restaurantId);
	if (!clients || clients.size === 0) {
		console.log(`[Broadcast] Restaurant ${restaurantId} → 0 clients`);
		return;
	}

	const data = JSON.stringify(message);
	console.log(`[Broadcast] Restaurant ${restaurantId} → ${clients.size} clients`);

	for (const client of clients) {
		if (client.readyState === client.OPEN) {
			client.send(data);
		}
	}
}

/**
 * Testing Notes:
 * - Verify client addition/removal tracking
 * - Test broadcast to multiple clients
 * - Validate empty restaurant cleanup
 * - Check connection state handling
 * - Verify JSON serialization works correctly
 * - Test with:
 *   - Multiple restaurants
 *   - High connection volumes
 *   - Rapid connect/disconnect cycles
 */
