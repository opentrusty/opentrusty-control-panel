// Audit API module

import { apiClient } from "./client";

interface AuditEvent {
    id: string;
    type: string;
    tenant_id?: string;
    actor_id: string;
    resource: string;
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

    /**
     * Get single audit event by ID
     */
    async get(eventId: string): Promise<AuditEvent> {
        return apiClient.get<AuditEvent>(`/audit/${eventId}`);
    },
};
