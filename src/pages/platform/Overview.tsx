import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Building2, ShieldAlert, Activity } from "lucide-react";

export default function PlatformOverview() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 border-b pb-4">Platform Control Center</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow hover:shadow-lg transition-shadow border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Total Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">Active</div>
            <p className="text-xs text-muted-foreground mt-1">Multi-tenant isolation active</p>
          </CardContent>
        </Card>

        <Card className="shadow hover:shadow-lg transition-shadow border-l-4 border-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Security State</CardTitle>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">Hardened</div>
            <p className="text-xs text-muted-foreground mt-1">CSRF & Session Isolation ON</p>
          </CardContent>
        </Card>

        <Card className="shadow hover:shadow-lg transition-shadow border-l-4 border-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">System Status</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">Normal</div>
            <p className="text-xs text-muted-foreground mt-1">Auth & Admin planes operational</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Welcome to OpenTrusty v1.0</h3>
        <p className="text-blue-800 text-sm leading-relaxed">
          As a Platform Administrator, you can provision new tenants and assign owners.
          All administrative actions are strictly audited and derived from your secure server-side session.
        </p>
      </div>
    </div>
  );
}
