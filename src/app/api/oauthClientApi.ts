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

// OAuth Client API module
// OAuth Client API module

import { apiClient } from "./client";

interface OAuthClient {
    id: string;
    client_id: string;
    client_name: string;
    client_type: "web_application" | "spa" | "backend_service";
    redirect_uris: string[];
    scopes: string[];
    created_at: string;
    tenant_id: string;
}

interface CreateClientRequest {
    client_name: string;
    redirect_uris: string[];
    allowed_scopes: string[];
    grant_types: string[];
    response_types: string[];
    token_endpoint_auth_method: string;
}

interface CreateClientResponse {
    client: OAuthClient;
    client_secret: string; // Only returned once
}

interface ListClientsResponse {
    clients: OAuthClient[];
    total: number;
}

export const oauthClientApi = {
    /**
     * List OAuth clients for current tenant
     */
    async list(tenantId: string): Promise<ListClientsResponse> {
        return apiClient.get<ListClientsResponse>(`/tenants/${tenantId}/clients`);
    },

    /**
     * Get client by ID
     */
    async get(tenantId: string, clientId: string): Promise<OAuthClient> {
        return apiClient.get<OAuthClient>(`/tenants/${tenantId}/clients/${clientId}`);
    },

    /**
     * Create new OAuth client
     */
    async create(tenantId: string, data: CreateClientRequest): Promise<CreateClientResponse> {
        return apiClient.post<CreateClientResponse>(`/tenants/${tenantId}/clients`, data);
    },

    /**
     * Update OAuth client
     */
    async update(tenantId: string, clientId: string, data: Partial<CreateClientRequest>): Promise<OAuthClient> {
        return apiClient.patch<OAuthClient>(`/tenants/${tenantId}/clients/${clientId}`, data);
    },

    /**
     * Regenerate client secret
     */
    async regenerateSecret(tenantId: string, clientId: string): Promise<{ client_secret: string }> {
        return apiClient.post<{ client_secret: string }>(`/tenants/${tenantId}/clients/${clientId}/secret`);
    },

    /**
     * Delete OAuth client
     */
    async delete(tenantId: string, clientId: string): Promise<void> {
        return apiClient.delete<void>(`/tenants/${tenantId}/clients/${clientId}`);
    },
};
