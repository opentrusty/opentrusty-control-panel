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
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../app/auth/AuthContext";
import { tenantApi, type TenantMetrics } from "../../app/api/tenantApi";

function StatsCard({ title, value, loading }: { title: string; value: string | number; loading?: boolean }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "..." : value}
            </p>
        </div>
    );
}

export default function TenantOverview() {
    const { tenantName, tenantId, isPlatformAdmin } = useAuth();
    const [metrics, setMetrics] = useState<TenantMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    if (isPlatformAdmin) {
        return <Navigate to="/platform" replace />;
    }

    useEffect(() => {
        if (tenantId) {
            tenantApi.getMetrics(tenantId)
                .then(setMetrics)
                .catch(err => {
                    console.error("Failed to fetch metrics:", err);
                })
                .finally(() => setLoading(false));
        }
    }, [tenantId]);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    {tenantName || 'Tenant'} Overview
                </h1>
                <p className="text-gray-500 mt-1">Manage your organization settings and access.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard title="Total Users" value={metrics?.total_users ?? 0} loading={loading} />
                <StatsCard title="OAuth Clients" value={metrics?.total_clients ?? 0} loading={loading} />
                <StatsCard title="Audit Logs (24h)" value={metrics?.audit_count_24h ?? 0} loading={loading} />
            </div>

            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="flex gap-4">
                <Link
                    to="/tenant/users"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                    Manage Users
                </Link>
                <Link
                    to="/tenant/clients"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    Manage OAuth Clients
                </Link>
            </div>
        </div>
    );
}
