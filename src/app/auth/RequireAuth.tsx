import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function RequireAuth({ children }: { children?: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login, preserving intended destination
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
}

export function RequirePlatformAdmin({ children }: { children: React.ReactNode }) {
    const { isPlatformAdmin, isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isPlatformAdmin) {
        // 403 Forbidden for authenticated users without platform admin role
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md text-center p-8 bg-white rounded-lg shadow">
                    <div className="text-6xl mb-4">🚫</div>
                    <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
                    <p className="text-gray-600 mb-6">
                        Platform admin role required to access this area.
                    </p>
                    <p className="text-sm text-gray-500">
                        If you believe this is an error, contact your administrator.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

export function RequireTenantAdmin({ children }: { children: React.ReactNode }) {
    const { isTenantAdmin, tenantId, isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Error boundary: tenant admin must have tenantId
    if (isTenantAdmin && !tenantId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="max-w-md text-center p-8 bg-white rounded-lg shadow border-2 border-red-500">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h1 className="text-3xl font-bold text-red-600 mb-4">Configuration Error</h1>
                    <p className="text-gray-700 mb-4">
                        Tenant admin role detected but no tenant context available.
                    </p>
                    <p className="text-sm text-gray-600 mb-6">
                        This should not happen. Please contact your system administrator.
                    </p>
                    <code className="block p-3 bg-gray-100 text-xs text-left rounded">
                        isTenantAdmin: true<br />
                        tenantId: null
                    </code>
                </div>
            </div>
        );
    }

    if (!isTenantAdmin) {
        // 403 Forbidden for authenticated users without tenant admin role
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md text-center p-8 bg-white rounded-lg shadow">
                    <div className="text-6xl mb-4">🚫</div>
                    <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
                    <p className="text-gray-600 mb-6">
                        Tenant admin role required to access this area.
                    </p>
                    <p className="text-sm text-gray-500">
                        If you believe this is an error, contact your tenant administrator.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
