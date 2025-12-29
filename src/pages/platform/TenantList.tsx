import { useState, useEffect } from "react";
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
import { Plus, Users } from "lucide-react";
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
import { Link } from "react-router-dom";

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

  const [createdCreds, setCreatedCreds] = useState<{ email: string, password: string } | null>(null);

  const form = useForm<z.infer<typeof createTenantSchema>>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      name: "",
      adminEmail: "",
      adminName: "",
    },
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

  const onSubmit = async (values: z.infer<typeof createTenantSchema>) => {
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
      form.reset();
      fetchTenants();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to create tenant");
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Creating..." : "Create Tenant"}
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
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/platform/tenants/${tenant.id}/users`}>
                        <Users className="h-4 w-4 mr-2" />
                        Manage users
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
