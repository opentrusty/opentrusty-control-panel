import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import Login from "../pages/login/LoginPage";
import Landing from "../pages/Landing";
import { RequireAuth } from "./auth/RequireAuth";
import { RequirePlatformAdmin, RequireTenantAccess } from "./auth/RouteGuards";
import PlatformLayout from "./layout/PlatformLayout";
import TenantLayout from "./layout/TenantLayout";
import TenantList from "../pages/platform/TenantList";
import PlatformAudit from "../pages/platform/PlatformAudit";
import TenantOverview from "../pages/tenant/TenantOverview";
import UserList from "../pages/tenant/UserList";
import ClientList from "../pages/tenant/ClientList";
import AuditList from "../pages/tenant/AuditList";
import Branding from "../pages/tenant/Branding";

// Stub pages
const AdminList = () => <div className="p-4"><h1>Platform Admins</h1><p>Coming soon...</p></div>;
const SystemSettings = () => <div className="p-4"><h1>System Settings</h1><p>Coming soon...</p></div>;

const AccessDenied = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md border">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">You do not have permission to view this page.</p>
        </div>
    </div>
);

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/access-denied" element={<AccessDenied />} />

                <Route element={<RequireAuth />}>
                    <Route path="/" element={<Landing />} />

                    {/* Platform Admin Routes */}
                    <Route element={<RequirePlatformAdmin />}>
                        <Route path="/platform" element={<PlatformLayout />}>
                            <Route path="tenants" element={<TenantList />} />
                            <Route path="admins" element={<AdminList />} />
                            <Route path="audit" element={<PlatformAudit />} />
                            <Route path="settings" element={<SystemSettings />} />
                        </Route>
                    </Route>

                    {/* Tenant Routes */}
                    <Route element={<RequireTenantAccess />}>
                        <Route path="/tenant" element={<TenantLayout />}>
                            <Route path="overview" element={<TenantOverview />} />
                            <Route path="users" element={<UserList />} />
                            <Route path="clients" element={<ClientList />} />
                            <Route path="audit" element={<AuditList />} />
                            <Route path="branding" element={<Branding />} />
                        </Route>
                    </Route>
                </Route>
            </Routes>
        </AuthProvider>
    );
}
