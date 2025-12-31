// Audit API module

import { apiClient } from "./client";

export interface AuditEvent {
    id: string;
    type: string;
    tenant_id?: string;
    actor_id: string;
    actor_name?: string;
    resource: string;
    target_name?: string;
    target_id?: string;
    ip_address?: string;
    user_agent?: string;
    metadata?: Record<string, unknown>;
    created_at: string;
}

interface ListAuditEventsParams {
    limit?: number;
    offset?: number;
    event_type?: string;
    actor_id?: string;
    start_date?: string;
    end_date?: string;
}

export interface AuditQueryRequest {
    tenant_id: string;
    start_date: string; // ISO format
    end_date: string;   // ISO format
    reason: string;
}

export interface AuditQueryResponse {
    id: string;
}

interface ListAuditEventsResponse {
    events: AuditEvent[];
    total: number;
}

export const auditApi = {
    /**
     * List platform-level audit events (platform admin only)
     */
    async listPlatform(params?: ListAuditEventsParams): Promise<ListAuditEventsResponse> {
        const query = new URLSearchParams(params as Record<string, string>).toString();
        return apiClient.get<ListAuditEventsResponse>(`/audit?${query}`);
    },

    /**
     * List tenant-level audit events
     */
    async listTenant(tenantId: string, params?: ListAuditEventsParams): Promise<ListAuditEventsResponse> {
        const query = new URLSearchParams(params as Record<string, string>).toString();
        return apiClient.get<ListAuditEventsResponse>(`/tenants/${tenantId}/audit?${query}`);
    },

    async get(eventId: string): Promise<AuditEvent> {
        return apiClient.get<AuditEvent>(`/audit/${eventId}`);
    },

    /**
     * Create an audit query declaration (Platform Admin only)
     */
    async createQuery(request: AuditQueryRequest): Promise<AuditQueryResponse> {
        return apiClient.post<AuditQueryResponse>("/audit-queries", request);
    },

    /**
     * Get results for a declared audit query
     */
    async getResults(queryId: string): Promise<ListAuditEventsResponse> {
        return apiClient.get<ListAuditEventsResponse>(`/audit-queries/${queryId}/results`);
    },
};
