import { client } from "./client";

export async function getUserProfile() {
    const { data, error } = await client.GET("/auth/me", {
        params: {
            header: {
                "X-Tenant-ID": "default"
            }
        }
    });

    if (error) {
        console.error("Failed to fetch user:", error);
        return;
    }

    console.log("User:", data);
}
