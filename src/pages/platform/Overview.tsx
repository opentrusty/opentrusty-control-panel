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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building2, Users, ShieldAlert, Activity, Key } from "lucide-react";
import { platformApi } from "../../app/api/platformApi";
import type { PlatformMetrics } from "../../app/api/platformApi";
import { auditApi } from "../../app/api/auditApi";

export default function PlatformOverview() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [mRes, aRes] = await Promise.all([
          platformApi.getMetrics(),
          auditApi.listPlatform({ limit: 10 })
        ]);
        setMetrics(mRes);
        setRecentActivity(aRes.events);
      } catch (err) {
        console.error("Failed to fetch platform overview data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 border-b pb-4">Platform Control Center</h1>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow hover:shadow-lg transition-shadow border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Total Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{loading ? "..." : metrics?.total_tenants || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Multi-tenant isolation active</p>
          </CardContent>
        </Card>

        <Card className="shadow hover:shadow-lg transition-shadow border-l-4 border-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Total Users</CardTitle>
            <Users className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{loading ? "..." : metrics?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Aggregated across tenants</p>
          </CardContent>
        </Card>

        <Card className="shadow hover:shadow-lg transition-shadow border-l-4 border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">OAuth Clients</CardTitle>
            <Key className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{loading ? "..." : metrics?.total_oauth_clients || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered applications</p>
          </CardContent>
        </Card>

        <Card className="shadow hover:shadow-lg transition-shadow border-l-4 border-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">System Status</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">Normal</div>
            <p className="text-xs text-muted-foreground mt-1">All planes operational</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Recent Platform Activity</h3>
            <ShieldAlert className="h-5 w-5 text-amber-500" />
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivity.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No recent activity detected.</div>
            ) : (
              recentActivity.map((event) => (
                <div key={event.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{event.type}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{event.resource}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(event.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-4 italic tracking-tight">OpenTrusty v1.0 Hardened</h3>
            <p className="text-blue-100 leading-relaxed mb-6">
              Welcome to the Platform Control Center. You are currently operating at
              <span className="font-bold text-white"> Global Authorization Scope</span>.
              Any changes made here affect multi-tenant isolation and platform security.
            </p>
            <div className="flex gap-4">
              <div className="bg-white/10 rounded px-3 py-1 text-xs backdrop-blur-sm border border-white/20">CSRF Active</div>
              <div className="bg-white/10 rounded px-3 py-1 text-xs backdrop-blur-sm border border-white/20">AES-256 Enabled</div>
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-10">
            <ShieldAlert size={160} />
          </div>
        </div>
      </div>
    </div>
  );
}
