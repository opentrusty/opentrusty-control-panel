import { apiClient } from "./client";

export interface PlatformMetrics {
    total_tenants: number;
    total_users: number;
    total_oauth_clients: number;
}

export const platformApi = {
    getMetrics: async (): Promise<PlatformMetrics> => {
        return apiClient.get<PlatformMetrics>("/metrics");
    }
};
