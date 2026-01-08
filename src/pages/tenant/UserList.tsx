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

import { useState, useEffect } from "react";
import { tenantApi } from "../../app/api/tenantApi";
import { useAuth } from "../../app/auth/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Edit } from "lucide-react";
import type { components } from "../../api/generated/schema"; // Type-only import
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "react-router-dom";

type TenantUserRole = components["schemas"]["github_com_opentrusty_opentrusty_internal_tenant.TenantUserRole"] & {
  email: string;
  full_name: string;
  nickname: string | null;
  picture: string | null;
};

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role_id: z.enum(["tenant_owner", "tenant_admin", "tenant_member"]),
});

export default function UserList() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const { isPlatformAdmin, isTenantAdmin } = useAuth();
  const [users, setUsers] = useState<TenantUserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<TenantUserRole | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [newNickname, setNewNickname] = useState<string>("");

  const form = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      password: "",
      role_id: "tenant_member",
    },
  });

  const fetchUsers = async () => {
    if (!tenantId) return;
    setIsLoading(true);
    try {
      const data = await tenantApi.listUsers(tenantId);
      if (data) setUsers(data as any[]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load users");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [tenantId]);

  const [provisionedCreds, setProvisionedCreds] = useState<{ email: string; password: string } | null>(null);

  const onSubmit = async (values: z.infer<typeof createUserSchema>) => {
    if (!tenantId) return;

    try {
      const response = await tenantApi.provisionUser(tenantId, {
        email: values.email,
        password: values.password,
        role_id: values.role_id,
      });
      // Backend now returns password in the response for one-time display
      if (response && (response as any).password) {
        setProvisionedCreds({ email: values.email, password: (response as any).password });
      } else {
        setProvisionedCreds({ email: values.email, password: values.password });
      }
      toast.success(`User provisioned successfully`);
      setIsCreateOpen(false);
      form.reset();
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to provision user");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleRevoke = async (userId: string, role: string) => {
    if (!tenantId) return;
    if (!confirm("Are you sure you want to remove this user from the tenant?")) return;

    try {
      await tenantApi.revokeRole(tenantId, userId, role);
      toast.success("User removed");
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove user");
    }
  };

  const handleUpdateUser = async () => {
    if (!tenantId || !editingUser) return;

    try {
      // 1. Update Role if changed
      if (newRole && newRole !== editingUser.role) {
        await tenantApi.revokeRole(tenantId, editingUser.user_id!, editingUser.role!);
        await tenantApi.assignRole(tenantId, editingUser.user_id!, newRole);
      }

      // 2. Update Nickname if changed
      if (newNickname !== undefined && newNickname !== editingUser.nickname) {
        await tenantApi.updateUserNickname(tenantId, editingUser.user_id!, newNickname);
      }

      toast.success("User updated successfully");
      setIsEditOpen(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update user");
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "-";
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  };

  // Platform admins should not see user management controls
  const canManageUsers = isTenantAdmin && !isPlatformAdmin;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            Manage users within this tenant.
          </p>
        </div>
        {canManageUsers && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Provision User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Provision User</DialogTitle>
                <DialogDescription>
                  Create a new user in this tenant and assign a role.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control as any}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="user@example.com" {...field} value={field.value as string} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} value={field.value as string} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="role_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tenant_owner">Tenant Owner</SelectItem>
                            <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                            <SelectItem value="tenant_member">Tenant Member</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? "Provisioning..." : "Provision User"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}

        {/* Credentials Display Dialog */}
        <Dialog open={provisionedCreds !== null} onOpenChange={() => setProvisionedCreds(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Provisioned Successfully</DialogTitle>
              <DialogDescription>
                <span className="text-amber-600 font-semibold">
                  ⚠️ This password will not be shown again. Copy it now.
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-gray-100 rounded font-mono text-sm">
                    {provisionedCreds?.email}
                  </code>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(provisionedCreds?.email || "")}>
                    Copy
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-gray-100 rounded font-mono text-sm">
                    {provisionedCreds?.password}
                  </code>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(provisionedCreds?.password || "")}>
                    Copy
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setProvisionedCreds(null)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User Profile</DialogTitle>
              <DialogDescription>
                Update <strong>{editingUser?.email}</strong>'s information and role.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium block mb-2">Nickname</label>
                <Input
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  placeholder="The user's display name"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Role</label>
                <Select onValueChange={setNewRole} value={newRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tenant_owner">Tenant Owner</SelectItem>
                    <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                    <SelectItem value="tenant_member">Tenant Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateUser}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined At</TableHead>
              {canManageUsers && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canManageUsers ? 5 : 4} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManageUsers ? 5 : 4} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {u.picture ? (
                        <img
                          src={u.picture}
                          alt={u.nickname || u.email}
                          className="h-8 w-8 rounded-full border border-gray-200"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                          {u.email[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold">{u.nickname || u.full_name || "Unknown"}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{u.user_id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'tenant_owner' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'tenant_admin' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(u.granted_at as any)}</TableCell>
                  {canManageUsers && (
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" title="Edit User" onClick={() => {
                        setEditingUser(u);
                        setNewRole(u.role || "");
                        setNewNickname(u.nickname || "");
                        setIsEditOpen(true);
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Remove User" onClick={() => handleRevoke(u.user_id!, u.role!)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div >
  );
}
