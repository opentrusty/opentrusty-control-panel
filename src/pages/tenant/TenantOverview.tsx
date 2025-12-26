import { Link } from "react-router-dom";
import { useAuth } from "../../app/auth/AuthContext";

function StatsCard({ title, value }: { title: string; value: string }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
    );
}

export default function TenantOverview() {
    const { tenantName } = useAuth();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    {tenantName || 'Tenant'} Overview
                </h1>
                <p className="text-gray-500 mt-1">Manage your organization settings and access.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard title="Total Users" value="-" />
                <StatsCard title="OAuth Clients" value="-" />
                <StatsCard title="Audit Logs (24h)" value="-" />
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
