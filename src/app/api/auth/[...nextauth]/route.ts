/**
 * File: authRoute.ts
 * Description: API route to handle authentication (sign in/out, callbacks) using NextAuth.js.
 *              This file simply re-exports the `GET` and `POST` handlers from a central auth configuration.
 * Author: William Anderson
 */

import { handlers } from "@/utils/auth"; // Re-exports NextAuth's built-in handlers

// Export GET and POST methods for the Next.js API route
export const { GET, POST } = handlers;
