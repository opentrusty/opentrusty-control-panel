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
