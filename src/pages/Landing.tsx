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

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/auth/AuthContext";

export default function Landing() {
    const { isPlatformAdmin, isTenantAdmin, tenantId, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoading) return;

        if (isPlatformAdmin) {
            navigate('/platform/tenants', { replace: true });
        } else if (isTenantAdmin && tenantId) {
            navigate('/tenant/overview', { replace: true });
        } else {
            console.error("Access denied: No valid role found for landing redirection");
            // Basic fallback if no role matches
            navigate('/access-denied', { replace: true });
        }
    }, [isPlatformAdmin, isTenantAdmin, tenantId, isLoading, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
                <p className="text-gray-500">Please wait while we direct you to your workspace.</p>
            </div>
        </div>
    );
}
