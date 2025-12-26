// Auth-related TypeScript types

export interface User {
    id: string;
    email: string;
    email_verified: boolean;
    profile?: {
        given_name?: string;
        family_name?: string;
        full_name?: string;
    };
}

export interface RoleAssignment {
    role_id: string;
    role_name: string;
    scope: 'platform' | 'tenant';
    scope_context_id?: string;
}

export interface AuthContextValue {
    // Authentication state
    isAuthenticated: boolean;
    user: User | null;

    // Authorization
    roleAssignments: RoleAssignment[];
    tenantId: string | null;  // NULL for platform admins, UUID for tenant admins
    tenantName: string | null;  // NULL for platform admins, name for tenant users
    isPlatformAdmin: boolean;
    isTenantAdmin: boolean;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;

    // Loading state
    isLoading: boolean;
}
