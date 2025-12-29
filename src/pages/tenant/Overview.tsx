import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Key, Users, Activity, ExternalLink, Plus } from "lucide-react";
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

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading your workspace...</div>;
  }

  const isFirstTime = clients.length === 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-gray-900 italic">
          {tenant?.name || "Workspace Overview"}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm font-medium uppercase tracking-widest text-gray-400">
          Control Plane for {tenant?.name || tenantId}
        </p>
      </div>

      {isFirstTime && (
        <div className="bg-indigo-600 rounded-xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-md">
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
            <div className="flex flex-col gap-3 p-4 bg-indigo-500/30 rounded-lg backdrop-blur-sm border border-indigo-400/30 text-xs font-mono">
              <div className="flex justify-between gap-4"><span>Issuer:</span> <span className="text-indigo-200">{issuerUrl}</span></div>
              <div className="flex justify-between gap-4"><span>Status:</span> <span className="text-green-400">Active</span></div>
            </div>
          </div>
          <Key className="absolute -right-12 -bottom-12 opacity-10 rotate-12" size={240} />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">OAuth Clients</CardTitle>
              <div className="text-2xl font-black text-gray-900 mt-1">{clients.length}</div>
            </div>
            <Key className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent className="text-xs text-gray-500 pb-2">
            Registered applications in this tenant.
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="ghost" size="sm" className="w-full text-blue-600 font-bold hover:text-blue-700 hover:bg-blue-50">
              <Link to={`/tenant/${tenantId}/clients`}>Manage Clients</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-t-4 border-t-indigo-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Users</CardTitle>
              <div className="text-2xl font-black text-gray-900 mt-1">{usersCount}</div>
            </div>
            <Users className="h-6 w-6 text-indigo-500" />
          </CardHeader>
          <CardContent className="text-xs text-gray-500 pb-2">
            Administrators and members with access.
          </CardContent>
          <CardFooter className="pt-0">
            <Button asChild variant="ghost" size="sm" className="w-full text-indigo-600 font-bold hover:text-indigo-700 hover:bg-indigo-50">
              <Link to={`/tenant/${tenantId}/users`}>Manage Users</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-t-4 border-t-amber-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Tenant ID</CardTitle>
              <div className="text-sm font-mono text-gray-900 mt-1 truncate max-w-[160px]">{tenantId}</div>
            </div>
            <Activity className="h-6 w-6 text-amber-500" />
          </CardHeader>
          <CardContent className="text-xs text-gray-500 pb-2">
            Use this in all API and OIDC requests.
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="w-full text-amber-600 font-bold hover:text-amber-700 hover:bg-amber-50" onClick={() => {
              navigator.clipboard.writeText(tenantId || '');
            }}>
              Copy ID
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Recent Activity Log</h3>
            <Link to={`/tenant/${tenantId}/audit`} className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 italic">No recent activity detected.</div>
            ) : (
              recentActivity.map(event => (
                <div key={event.id} className="p-4 flex justify-between items-center hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <div>
                      <div className="text-xs font-bold text-gray-900 capitalize">{event.type.replace(/_/g, ' ')}</div>
                      <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                        {event.actor_name || event.actor_id} • {event.resource}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400 font-bold">{new Date(event.created_at).toLocaleTimeString()}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-6 text-white border-l-4 border-l-indigo-500 shadow-lg">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <ExternalLink size={18} className="text-indigo-400" />
              OIDC Endpoints
            </h3>
            <div className="space-y-3 font-mono text-[11px]">
              <div className="p-2 bg-white/5 rounded border border-white/10">
                <div className="text-gray-500 mb-1">DISCOVERY URL</div>
                <div className="text-indigo-300 break-all">{issuerUrl}/.well-known/openid-configuration</div>
              </div>
              <div className="p-2 bg-white/5 rounded border border-white/10">
                <div className="text-gray-500 mb-1">TOKEN ENDPOINT</div>
                <div className="text-indigo-300 break-all">{issuerUrl}/oauth2/token</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
