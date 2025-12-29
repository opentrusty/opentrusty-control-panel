// Tenant API module

import { apiClient } from "./client";

interface Tenant {
    id: string;
    name: string;
    created_at: string;
    status: "active" | "suspended" | "deleted";
}

interface CreateTenantRequest {
    name: string;
}

export const tenantApi = {
    /**
     * List all tenants (platform admin only)
     */
    async list(): Promise<Tenant[]> {
        return apiClient.get<Tenant[]>("/tenants");
    },

    /**
     * Get tenant by ID
     */
    async get(tenantId: string): Promise<Tenant> {
        return apiClient.get<Tenant>(`/tenants/${tenantId}`);
    },

    /**
     * Create new tenant (platform admin only)
     */
    async create(data: CreateTenantRequest): Promise<Tenant> {
        return apiClient.post<Tenant>("/tenants", data);
    },

    /**
     * Update tenant
     */
    async update(tenantId: string, data: Partial<Tenant>): Promise<Tenant> {
        return apiClient.patch<Tenant>(`/tenants/${tenantId}`, data);
    },

    /**
     * Delete tenant (platform admin only)
     */
    async delete(tenantId: string): Promise<void> {
        return apiClient.delete<void>(`/tenants/${tenantId}`);
    },

    /**
     * List users in a tenant
     */
    async listUsers(tenantId: string): Promise<any[]> {
        return apiClient.get<any[]>(`/tenants/${tenantId}/users`);
    },

    /**
     * Provision user in a tenant
     */
    async provisionUser(tenantId: string, data: any): Promise<any> {
        return apiClient.post<any>(`/tenants/${tenantId}/users`, data);
    },
};
