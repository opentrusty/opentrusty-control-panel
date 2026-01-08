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

// Auth API module
// Auth API module

import { apiClient } from "./client";


interface LoginResponse {
    user_id: string;
    email: string;
}

interface User {
    id: string;
    email: string;
    email_verified: boolean;
    profile?: {
        given_name?: string;
        family_name?: string;
        full_name?: string;
    };
}

interface RoleAssignment {
    role_id: string;
    role_name: string;
    scope: "platform" | "tenant";
    scope_context_id?: string;
}

interface MeResponse {
    user: User;
    role_assignments?: RoleAssignment[];
    current_tenant?: {
        tenant_id: string;
        tenant_name: string;
    };
}

export const authApi = {
    /**
     * Login with email and password
     * Control Plane Model: No X-Tenant-ID header, tenant derived from user record
     */
    async login(email: string, password: string): Promise<LoginResponse> {
        return apiClient.post<LoginResponse>("/auth/login", { email, password });
    },

    /**
     * Get current user session info
     * Returns user data and role assignments from session
     */
    async me(): Promise<MeResponse> {
        return apiClient.get<MeResponse>("/auth/me");
    },

    /**
     * Logout current session
     */
    async logout(): Promise<void> {
        return apiClient.post<void>("/auth/logout");
    },
};
