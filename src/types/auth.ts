// Copyright 2026 The OpenTrusty Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Auth-related TypeScript types
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
