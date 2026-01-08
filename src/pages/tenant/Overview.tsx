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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Key, Users, Activity, Plus, ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { oauthClientApi } from "../../app/api/oauthClientApi";
import { tenantApi } from "../../app/api/tenantApi";
import { auditApi } from "../../app/api/auditApi";

export default function TenantOverview() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [clients, setClients] = useState<any[]>([]);
  const [tenant, setTenant] = useState<any>(null);
  const [usersCount, setUsersCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Issuer URL calculation logic
  const issuerUrl = window.location.origin.replace('console', 'auth');

  useEffect(() => {
    if (!tenantId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [cRes, uRes, aRes, tRes] = await Promise.all([
          oauthClientApi.list(tenantId),
          tenantApi.listUsers(tenantId),
          auditApi.listTenant(tenantId, { limit: 5 }),
          tenantApi.get(tenantId)
        ]);
        setClients(cRes.clients || []);
        setUsersCount((uRes || []).length);
        setRecentActivity(aRes.events || []);
        setTenant(tRes);
      } catch (err) {
        console.error("Failed to fetch tenant overview data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tenantId]);

  const isFirstTime = !loading && clients.length === 0;
  const displayName = tenant?.name || "Loading...";

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900 italic">
            Workspace Overview: {displayName}
          </h2>
        </div>

        {/* Issuer Info Block - Always Visible */}
        <div className="flex flex-col gap-2 p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-mono min-w-[300px]">
          <div className="flex justify-between gap-4">
            <span className="text-gray-500 uppercase tracking-wider font-semibold">Issuer:</span>
            <span className="text-indigo-700 font-bold">{issuerUrl}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500 uppercase tracking-wider font-semibold">Status:</span>
            <span className="text-green-600 font-bold">Active</span>
          </div>
        </div>
      </div>

      {/* Zero State Banner - Only if no clients */}
      {isFirstTime && (
        <div className="bg-indigo-600 rounded-xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="text-2xl font-bold mb-2">Welcome to your new Tenant!</h3>
              <p className="text-indigo-100 mb-4 leading-relaxed">
                To start issuing tokens, you need to register your first OAuth 2.0 application.
                This will provide you with a Client ID and Secret.
              </p>
              <Button asChild variant="secondary" className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold border-none">
                <Link to={`/tenant/${tenantId}/clients/new`}>
                  <Plus className="mr-2 h-4 w-4" /> Create Your First OAuth Client
                </Link>
              </Button>
            </div>
          </div>
          <Key className="absolute -right-12 -bottom-12 opacity-10 rotate-12" size={240} />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">OAuth Clients</CardTitle>
              <div className="text-2xl font-black text-gray-900 mt-1">{clients.length}</div>
            </div>
            <Key className="h-6 w-6 text-blue-500" />
          </CardHeader>
        </Card>

        <Card className="border-t-4 border-t-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Users</CardTitle>
              <div className="text-2xl font-black text-gray-900 mt-1">{usersCount}</div>
            </div>
            <Users className="h-6 w-6 text-green-500" />
          </CardHeader>
        </Card>

        <Card className="border-t-4 border-t-purple-500 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50">
          <Link to={`/tenant/${tenantId}/audit`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Audit Logs</CardTitle>
                <div className="text-xs text-gray-400 mt-2 font-medium">View Activity &rarr;</div>
              </div>
              <Activity className="h-6 w-6 text-purple-500" />
            </CardHeader>
          </Link>
        </Card>

        <Card className="border-t-4 border-t-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="overflow-hidden">
              <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Tenant ID</CardTitle>
              <div className="text-xs font-mono text-gray-600 mt-1 truncate" title={tenantId}>{tenantId}</div>
            </div>
            <Activity className="h-6 w-6 text-orange-500" />
          </CardHeader>
        </Card>
      </div>

      {/* Bottom Section: Activity & API Endpoints */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Activity */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500">No recent activity found.</p>
              ) : (
                recentActivity.map((event) => (
                  <div key={event.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">{event.type}</p>
                      <p className="text-xs text-gray-500">{new Date(event.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-700">{event.target_name || event.target_id || "-"}</p>
                      <p className="text-xs text-gray-500">by {event.actor_name || event.actor_id}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">OIDC Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div>
              <div className="font-medium text-gray-500 mb-1 text-xs uppercase tracking-wider">Authorization Endpoint</div>
              <code className="bg-gray-100 p-2 rounded block text-xs break-all text-gray-700 border">{issuerUrl}/oauth2/auth</code>
            </div>
            <div>
              <div className="font-medium text-gray-500 mb-1 text-xs uppercase tracking-wider">Token Endpoint</div>
              <code className="bg-gray-100 p-2 rounded block text-xs break-all text-gray-700 border">{issuerUrl}/oauth2/token</code>
            </div>
            <div>
              <div className="font-medium text-gray-500 mb-1 text-xs uppercase tracking-wider">UserInfo Endpoint</div>
              <code className="bg-gray-100 p-2 rounded block text-xs break-all text-gray-700 border">{issuerUrl}/oidc/userinfo</code>
            </div>
            <div>
              <div className="font-medium text-gray-500 mb-1 text-xs uppercase tracking-wider">Discovery URL</div>
              <code className="bg-gray-100 p-2 rounded block text-xs break-all text-gray-700 border">{issuerUrl}/.well-known/openid-configuration</code>
            </div>
            <div className="pt-2">
              <a href={`${issuerUrl}/.well-known/openid-configuration`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium">
                OpenID Configuration <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
