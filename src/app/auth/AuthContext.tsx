import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authApi, apiClient, UnauthorizedError } from "../api";
import type { AuthContextValue, User, RoleAssignment } from "../../types/auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [tenantName, setTenantName] = useState<string | null>(null);

    // Derive role flags
    const isPlatformAdmin = roleAssignments.some(
        (r) => r.scope === "platform" && r.role_name === "platform_admin"
    );
    const isTenantAdmin = roleAssignments.some(
        (r) => r.scope === "tenant" && (r.role_name === "tenant_admin" || r.role_name === "tenant_owner")
    );

    const handleUnauthorized = () => {
        setIsAuthenticated(false);
        setUser(null);
        setRoleAssignments([]);
    };

    // Set up unauthorized handler
    useEffect(() => {
        apiClient.setUnauthorizedHandler(handleUnauthorized);
    }, []);

    const checkSession = async () => {
        setIsLoading(true);
        try {
            const data = await authApi.me();
            setIsAuthenticated(true);
            setUser(data.user);
            setRoleAssignments((data.role_assignments || []) as RoleAssignment[]);

            // Extract tenant context from session (server-provided)
            if (data.current_tenant) {
                setTenantId(data.current_tenant.tenant_id);
                setTenantName(data.current_tenant.tenant_name);
            } else {
                setTenantId(null);
                setTenantName(null);
            }
        } catch (err) {
            if (err instanceof UnauthorizedError) {
                // Already handled by unauthorized handler
                return;
            }
            console.error("Session check failed:", err);
            setIsAuthenticated(false);
            setUser(null);
            setRoleAssignments([]);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        await authApi.login(email, password);
        // After successful login, check session to get full user data
        await checkSession();
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            setRoleAssignments([]);
            setTenantId(null);
            setTenantName(null);
        }
    };

    // Check session on mount
    useEffect(() => {
        checkSession();
    }, []);

    const value: AuthContextValue = {
        isAuthenticated,
        user,
        roleAssignments,
        tenantId,
        tenantName,
        isPlatformAdmin,
        isTenantAdmin,
        login,
        logout,
        checkSession,
        isLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
