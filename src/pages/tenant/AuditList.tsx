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

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auditApi, type AuditEvent } from "../../app/api/auditApi";

export default function AuditList() {
    const { tenantId } = useParams<{ tenantId: string }>();
    const [events, setEvents] = useState<AuditEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return "-";
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(dateStr));
    };

    useEffect(() => {
        if (!tenantId) return;

        const fetchLogs = async () => {
            try {
                setLoading(true);
                const response = await auditApi.listTenant(tenantId);
                setEvents(response.events || []);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch audit logs:", err);
                setError("Failed to load audit logs. Please check your permissions.");
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [tenantId]);

    if (loading) {
        return <div className="p-4 text-center text-gray-400">Loading audit logs...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-600 bg-red-50 rounded-lg">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 italic">Audit Logs</h1>
                <p className="mt-1 text-sm text-gray-500 font-medium uppercase tracking-widest text-gray-400">
                    A record of all sensitive actions within this tenant.
                </p>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No audit events found.
                                </td>
                            </tr>
                        ) : (
                            events.map((event) => (
                                <tr key={event.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(event.created_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {event.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {event.resource}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {event.actor_name || event.actor_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{event.target_name || "-"}</span>
                                            <span className="font-mono text-[10px] text-gray-400">{event.target_id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {event.metadata && (
                                            <div className="flex flex-col space-y-1">
                                                {!!event.metadata.tenant_name && (
                                                    <span>Tenant: <strong>{String(event.metadata.tenant_name)}</strong></span>
                                                )}
                                                {!!event.metadata.email && (
                                                    <span>Email: {String(event.metadata.email)}</span>
                                                )}
                                                {!!event.metadata.changes && (
                                                    <div className="text-xs text-gray-400">
                                                        {!!(event.metadata.changes as Record<string, unknown>).name_from && (
                                                            <span>Renamed: {String((event.metadata.changes as Record<string, unknown>).name_from)} → {String((event.metadata.changes as Record<string, unknown>).name_to)}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
