import type WebSocket from "ws";

const restaurantClients = new Map<string, Set<WebSocket>>();

export function addClient(restaurantId: string, client: WebSocket) {
	if (!restaurantClients.has(restaurantId)) {
		restaurantClients.set(restaurantId, new Set());
	}
	restaurantClients.get(restaurantId)!.add(client);
	console.log(`[wsStore] Added client for ${restaurantId}. Total clients: ${restaurantClients.get(restaurantId)!.size}`);
}

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

export function getClients(restaurantId: string): Set<WebSocket> {
	return restaurantClients.get(restaurantId) || new Set();
}

export function broadcastToRestaurant(restaurantId: string, message: any) {
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
