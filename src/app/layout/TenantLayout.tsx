import { Outlet, Link, useLocation, useParams, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function TenantLayout() {
    const { user, tenantName, logout, isPlatformAdmin, isLoading } = useAuth();
    const { tenantId } = useParams<{ tenantId: string }>();
    const location = useLocation();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    // Access Guard: Platform Admins should not access tenant-scoped UI
    // Note: If a user has BOTH platform and tenant roles, they might still want to see this,
    // but the current requirement says "Disable/Remove tenant-scoped navigation and routes for Platform Admins".
    if (isPlatformAdmin) {
        console.warn("Platform Admin attempted to access tenant-scoped UI. Redirecting...");
        return <Navigate to="/platform/overview" replace />;
    }

    const isActive = (path: string) => location.pathname.startsWith(path);

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white">
                <div className="p-4">
                    <h1 className="text-xl font-bold">Tenant Admin</h1>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{tenantName || 'Workspace'}</p>
                </div>

                <nav className="mt-8">
                    <Link
                        to={`/tenant/${tenantId || ''}/overview`}
                        className={`block px-4 py-2 hover:bg-gray-800 ${isActive('/tenant/overview') ? 'bg-gray-800 text-white' : 'text-gray-300'}`}
                    >
                        Overview
                    </Link>
                    <Link
                        to={`/tenant/${tenantId || ''}/users`}
                        className={`block px-4 py-2 hover:bg-gray-800 ${isActive('/tenant/users') ? 'bg-gray-800 text-white' : 'text-gray-300'}`}
                    >
                        Users
                    </Link>
                    <Link
                        to={`/tenant/${tenantId || ''}/clients`}
                        className={`block px-4 py-2 hover:bg-gray-800 ${isActive('/tenant/clients') ? 'bg-gray-800 text-white' : 'text-gray-300'}`}
                    >
                        OAuth Clients
                    </Link>
                    <div className="pt-4 pb-2">
                        <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Monitoring
                        </p>
                    </div>
                    <Link
                        to={`/tenant/${tenantId || ''}/audit`}
                        className={`block px-4 py-2 hover:bg-gray-800 ${isActive('/tenant/audit') ? 'bg-gray-800 text-white' : 'text-gray-300'}`}
                    >
                        Audit Logs
                    </Link>
                    <Link
                        to={`/tenant/${tenantId || ''}/branding`}
                        className={`block px-4 py-2 hover:bg-gray-800 ${isActive('/tenant/branding') ? 'bg-gray-800 text-white' : 'text-gray-300'}`}
                    >
                        Branding
                    </Link>
                </nav>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Top bar */}
                <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">{tenantName} Administration</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm">{user?.email}</span>
                        <button
                            onClick={() => logout()}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
