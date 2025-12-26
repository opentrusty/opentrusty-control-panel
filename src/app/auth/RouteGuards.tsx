import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function RequirePlatformAdmin() {
    const { isPlatformAdmin, isLoading } = useAuth();

    if (isLoading) {
        return <div className="p-4">Loading access rights...</div>;
    }

    if (!isPlatformAdmin) {
        return <Navigate to="/access-denied" replace />;
    }
    return <Outlet />;
}

export function RequireTenantAccess() {
    const { isTenantAdmin, tenantId, isLoading } = useAuth();

    if (isLoading) {
        return <div className="p-4">Loading access rights...</div>;
    }

    if (!isTenantAdmin || !tenantId) {
        return <Navigate to="/access-denied" replace />;
    }
    return <Outlet />;
}
