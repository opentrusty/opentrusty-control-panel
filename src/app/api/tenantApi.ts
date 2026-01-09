// Copyright 2026 The OpenTrusty Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Tenant API module
// Tenant API module

import { apiClient } from "./client";
import type { User } from "../../types/auth";

interface Tenant {
    id: string;
    name: string;
    created_at: string;
    status: "active" | "suspended" | "deleted";
}

export interface TenantMetrics {
    total_users: number;
    total_clients: number;
    audit_count_24h: number;
}

interface CreateTenantRequest {
    name: string;
    admin_email?: string;
    admin_name?: string;
}

interface CreateTenantResponse extends Tenant {
    admin_credentials?: {
        email: string;
        password: string;
        warning: string;
    };
    admin_email?: string;
    admin_password?: string;
    password_warning?: string;
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
    async create(data: CreateTenantRequest): Promise<CreateTenantResponse> {
        return apiClient.post<CreateTenantResponse>("/tenants", data);
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
    async listUsers(tenantId: string): Promise<User[]> {
        return apiClient.get<User[]>(`/tenants/${tenantId}/users`);
    },

    /**
     * Provision user in a tenant
     */
    async provisionUser(tenantId: string, data: { email: string; nickname?: string; role_name?: string }): Promise<User> {
        return apiClient.post<User>(`/tenants/${tenantId}/users`, data);
    },

    /**
     * Get tenant metrics
     */
    async getMetrics(tenantId: string): Promise<TenantMetrics> {
        return apiClient.get<TenantMetrics>(`/tenants/${tenantId}/metrics`);
    },

    /**
     * Assign role to user
     */
    async assignRole(tenantId: string, userId: string, role: string): Promise<void> {
        return apiClient.post<void>(`/tenants/${tenantId}/users/${userId}/roles`, { role });
    },

    /**
     * Revoke role from user
     */
    async revokeRole(tenantId: string, userId: string, role: string): Promise<void> {
        return apiClient.delete<void>(`/tenants/${tenantId}/users/${userId}/roles/${role}`);
    },

    /**
     * Update user profile (nickname)
     */
    async updateUserNickname(tenantId: string, userId: string, nickname: string): Promise<void> {
        return apiClient.patch<void>(`/tenants/${tenantId}/users/${userId}`, { nickname });
    },
};
