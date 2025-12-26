import createClient from "openapi-fetch";
import type { paths } from "./generated/schema"; // make sure this path matches your generated file

console.log("Initializing API client with baseUrl: /api/v1");
// Tenant context is derived from the authenticated session on the backend.
// The session contains the user's tenant_id, which is automatically applied
// by the AuthMiddleware. No need to send X-Tenant-ID from the client.
export const client = createClient<paths>({
    baseUrl: "/api/v1",
});
