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

import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { tenantApi } from "../../app/api/tenantApi";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import type { components } from "../../api/generated/schema";
import { toast } from "sonner";

type TenantUserRole = components["schemas"]["github_com_opentrusty_opentrusty_internal_tenant.TenantUserRole"];



export default function TenantUsers() {
    const { tenantId } = useParams<{ tenantId: string }>();
    const [users, setUsers] = useState<TenantUserRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        if (!tenantId) return;
        setIsLoading(true);
        // Using the manually patched GET method
        try {
            const data = await tenantApi.listUsers(tenantId);
            // The API returns the array directly
            if (data) {
                setUsers(data as TenantUserRole[]);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load users");
        }
        setIsLoading(false);
    }, [tenantId]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    if (!tenantId) return <div>Invalid Tenant ID</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                    <Link to="/platform/tenants">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tenants
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Tenant Users</h2>
                    <p className="text-muted-foreground">
                        Manage users for tenant {tenantId}
                    </p>
                </div>
            </div>

            <div className="flex justify-end">
                {/* User provisioning is restricted to Tenant Admins only. Platform Admins view-only. */}
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((u) => (
                                <TableRow key={u.user_id}>
                                    <TableCell className="font-mono text-xs">{u.user_id}</TableCell>
                                    <TableCell>{u.role}</TableCell>
                                    <TableCell>{u.granted_at ? new Date(u.granted_at).toLocaleDateString() : "-"}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
