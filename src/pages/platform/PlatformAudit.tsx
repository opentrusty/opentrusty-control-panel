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

import { useState, useEffect } from "react";
import { auditApi, type AuditEvent, type AuditQueryRequest } from "../../app/api/auditApi";

type TabType = "platform" | "declaration";

export default function PlatformAudit() {
    const [activeTab, setActiveTab] = useState<TabType>("platform");
    const [platformEvents, setPlatformEvents] = useState<AuditEvent[]>([]);
    const [platformLoading, setPlatformLoading] = useState(true);
    const [platformError, setPlatformError] = useState<string | null>(null);

    const [events, setEvents] = useState<AuditEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [queryId, setQueryId] = useState<string | null>(null);
    const [declaration, setDeclaration] = useState<AuditQueryRequest>({
        tenant_id: "",
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        reason: "",
    });

    // Fetch platform logs on mount
    useEffect(() => {
        const fetchPlatformLogs = async () => {
            try {
                setPlatformLoading(true);
                const response = await auditApi.listPlatform();
                setPlatformEvents(response.events);
                setPlatformError(null);
            } catch (err: any) {
                console.error("Failed to fetch platform audit logs:", err);
                setPlatformError(err.response?.data?.error || "Failed to load platform audit logs.");
            } finally {
                setPlatformLoading(false);
            }
        };
        fetchPlatformLogs();
    }, []);

    const handleDeclare = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const start = new Date(declaration.start_date).toISOString();
            const end = new Date(declaration.end_date).toISOString();

            const response = await auditApi.createQuery({
                ...declaration,
                start_date: start,
                end_date: end,
            });

            setQueryId(response.id);

            const result = await auditApi.getResults(response.id);
            setEvents(result.events);
        } catch (err: any) {
            console.error("Audit declaration failed:", err);
            setError(err.response?.data?.error || "Failed to declare audit access intent.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setQueryId(null);
        setEvents([]);
        setError(null);
    };

    const tabClasses = (tab: TabType) =>
        `px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 ${activeTab === tab
            ? "border-blue-600 text-blue-600 bg-white"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        }`;

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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                <p className="mt-1 text-sm text-gray-500">
                    View platform-level audit events or request scoped access to tenant logs.
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4">
                    <button className={tabClasses("platform")} onClick={() => setActiveTab("platform")}>
                        Platform Logs
                    </button>
                    <button className={tabClasses("declaration")} onClick={() => { setActiveTab("declaration"); reset(); }}>
                        Tenant Access Declaration
                    </button>
                </nav>
            </div>

            {/* Platform Logs Tab */}
            {activeTab === "platform" && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                    {platformLoading ? (
                        <div className="p-6 text-center text-gray-400">Loading platform logs...</div>
                    ) : platformError ? (
                        <div className="p-6 text-red-600 bg-red-50">{platformError}</div>
                    ) : (
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
                                {platformEvents.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No platform audit events found.
                                        </td>
                                    </tr>
                                ) : (
                                    platformEvents.map((event) => (
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
                                                {event.target_name || event.target_id || "-"}
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
                                                                {!!(event.metadata.changes as any).name_from && (
                                                                    <span>Renamed: {String((event.metadata.changes as any).name_from)} → {String((event.metadata.changes as any).name_to)}</span>
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
                    )}
                </div>
            )}

            {/* Declaration Tab */}
            {activeTab === "declaration" && !queryId && (
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                        <p className="text-sm text-amber-800">
                            <strong>Security Notice:</strong> Platform Admin access to tenant audit logs requires explicit declaration. This action is permanently logged.
                        </p>
                    </div>

                    <form onSubmit={handleDeclare} className="bg-white shadow sm:rounded-lg border border-gray-200 p-6 space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="tenant_id" className="block text-sm font-medium text-gray-700">Target Tenant ID</label>
                            <input
                                id="tenant_id"
                                type="text"
                                required
                                placeholder="UUID of the tenant"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                value={declaration.tenant_id}
                                onChange={(e) => setDeclaration({ ...declaration, tenant_id: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date</label>
                                <input
                                    id="start_date"
                                    type="date"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={declaration.start_date}
                                    onChange={(e) => setDeclaration({ ...declaration, start_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">End Date</label>
                                <input
                                    id="end_date"
                                    type="date"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={declaration.end_date}
                                    onChange={(e) => setDeclaration({ ...declaration, end_date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Justification (Mandatory)</label>
                            <textarea
                                id="reason"
                                required
                                rows={3}
                                placeholder="Explain the technical or compliance need for this access..."
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                value={declaration.reason}
                                onChange={(e) => setDeclaration({ ...declaration, reason: e.target.value })}
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? "Authorizing..." : "Submit Access Declaration"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Declaration Results */}
            {activeTab === "declaration" && queryId && (
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Scoped Audit Results</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Results for Tenant <span className="font-mono text-gray-700 font-medium">{declaration.tenant_id}</span>
                            </p>
                        </div>
                        <button
                            onClick={reset}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
                        >
                            New Search
                        </button>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-blue-800 font-bold uppercase tracking-wide text-xs">Read-Only Scoped Access</span>
                        </div>
                        <p className="mt-2 text-sm text-blue-700">
                            This view is restricted to the declared time window and tenant.
                            This access has been recorded with reason: <em>"{declaration.reason}"</em>
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
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {events.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No audit events found in this window.
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
                                                {event.target_name || event.target_id || "-"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
