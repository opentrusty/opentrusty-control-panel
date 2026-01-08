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
import { Link } from "react-router-dom";
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
import { Plus } from "lucide-react";
import type { components } from "../../api/generated/schema";
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

type Tenant = components["schemas"]["github_com_opentrusty_opentrusty_internal_tenant.Tenant"];

const createTenantSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  adminEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  adminName: z.string().optional(),
});

export default function TenantList() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  const [createdCreds, setCreatedCreds] = useState<{ email: string, password: string } | null>(null);

  const createForm = useForm<z.infer<typeof createTenantSchema>>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      name: "",
      adminEmail: "",
      adminName: "",
    },
  });

  const editForm = useForm<{ name: string }>({
    resolver: zodResolver(z.object({ name: z.string().min(3).max(100) })),
    defaultValues: { name: "" },
  });

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const data = await tenantApi.list();
      // tenantApi returns the array directly
      if (Array.isArray(data)) {
        setTenants(data);
      } else {
        // Fallback/Safety check
        console.error("Unexpected response format:", data);
        setTenants([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load tenants");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const onSubmitCreate = async (values: z.infer<typeof createTenantSchema>) => {
    try {
      const newTenant = await tenantApi.create({
        name: values.name,
        admin_email: values.adminEmail || undefined,
        admin_name: values.adminName || undefined,
      });

      if (newTenant.admin_password) {
        setCreatedCreds({
          email: newTenant.admin_email!,
          password: newTenant.admin_password!
        });
        toast.success(`Tenant ${newTenant.name} created successfully`);
      } else {
        toast.success(`Tenant ${newTenant.name} created successfully`, {
          description: `Next: Click "Manage users" to provision an initial tenant administrator.`,
          duration: 5000,
        });
      }
      setIsCreateOpen(false);
      createForm.reset();
      fetchTenants();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to create tenant");
    }
  };

  const onSubmitEdit = async (values: { name: string }) => {
    if (!editingTenant) return;
    try {
      await tenantApi.update(editingTenant.id!, { name: values.name });
      toast.success("Tenant updated successfully");
      setIsEditOpen(false);
      setEditingTenant(null);
      fetchTenants();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update tenant");
    }
  };

  const openEditDialog = (tenant: Tenant) => {
    setEditingTenant(tenant);
    editForm.reset({ name: tenant.name });
    setIsEditOpen(true);
  };

  const handleDeleteTenant = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete tenant ${name}? This action cannot be undone.`)) return;

    try {
      await tenantApi.delete(id);
      toast.success(`Tenant ${name} deleted`);
      fetchTenants();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete tenant");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tenants</h2>
          <p className="text-muted-foreground">
            Manage platform tenants and their subscriptions.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tenant</DialogTitle>
              <DialogDescription>
                Add a new tenant to the platform. After creation, use "Manage users" to provision an initial tenant administrator.
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenant Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium text-sm">Initial Administrator (Optional)</h4>
                  <FormField
                    control={createForm.control}
                    name="adminName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="adminEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Email</FormLabel>
                        <FormControl>
                          <Input placeholder="admin@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createForm.formState.isSubmitting}>
                    {createForm.formState.isSubmitting ? "Creating..." : "Create Tenant"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!createdCreds} onOpenChange={(open) => !open && setCreatedCreds(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tenant Created Successfully</DialogTitle>
              <DialogDescription>
                Initial administrator credentials have been generated.
                <br />
                <strong>Please copy them now. They will not be shown again.</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 p-4 bg-muted rounded-md text-sm font-mono">
              <div className="grid grid-cols-[80px_1fr] gap-2">
                <span className="text-muted-foreground">Email:</span>
                <span className="select-all">{createdCreds?.email}</span>
                <span className="text-muted-foreground">Password:</span>
                <span className="select-all font-bold">{createdCreds?.password}</span>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setCreatedCreds(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No tenants found.
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell className="font-mono text-xs">{tenant.id}</TableCell>
                  <TableCell>{tenant.status}</TableCell>
                  <TableCell>{new Date(tenant.created_at!).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/platform/tenants/${tenant.id}/users`}>View users</Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(tenant)}>Edit</Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTenant(tenant.id!, tenant.name!)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
            <DialogDescription>
              Update the tenant's details.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tenant Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={editForm.formState.isSubmitting}>
                  {editForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div >
  );
}
