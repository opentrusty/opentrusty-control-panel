import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth, RequirePlatformAdmin, RequireTenantAdmin } from "./auth/RequireAuth";
import LoginPage from "../pages/login/LoginPage";
import PlatformLayout from "./layout/PlatformLayout";
import TenantLayout from "./layout/TenantLayout";

// Platform Admin Pages
import PlatformOverview from "../pages/platform/Overview";
import TenantList from "../pages/platform/TenantList";
import AdminList from "../pages/platform/AdminList";

// Tenant Admin Pages
import TenantOverview from "../pages/tenant/Overview";
import UserList from "../pages/tenant/UserList";
import ClientList from "../pages/tenant/ClientList";
import ClientCreateWizard from "../pages/tenant/ClientCreateWizard";

export const router = createBrowserRouter(
    [
        {
            path: "/",
            element: <Navigate to="/login" replace />,
        },
        {
            path: "/login",
            element: <LoginPage />,
        },
        {
            path: "/platform",
            element: (
                <RequireAuth>
                    <RequirePlatformAdmin>
                        <PlatformLayout />
                    </RequirePlatformAdmin>
                </RequireAuth>
            ),
            children: [
                {
                    index: true,
                    element: <Navigate to="/platform/tenants" replace />,
                },
                {
                    path: "overview",
                    element: <PlatformOverview />,
                },
                {
                    path: "tenants",
                    element: <TenantList />,
                },
                {
                    path: "admins",
                    element: <AdminList />,
                },
            ],
        },
        {
            path: "/tenant/:tenantId",
            element: (
                <RequireAuth>
                    <RequireTenantAdmin>
                        <TenantLayout />
                    </RequireTenantAdmin>
                </RequireAuth>
            ),
            children: [
                {
                    index: true,
                    element: <Navigate to="overview" replace />,
                },
                {
                    path: "overview",
                    element: <TenantOverview />,
                },
                {
                    path: "users",
                    element: <UserList />,
                },
                {
                    path: "clients",
                    element: <ClientList />,
                },
                {
                    path: "clients/new",
                    element: <ClientCreateWizard />,
                },
            ],
        },
    ],
    {
        basename: "/admin",
    }
);
