import { useState, useEffect } from "react";
import { client } from "../../api/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Copy } from "lucide-react";
import type { paths } from "../../api/generated/schema";
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
import { Label } from "@/components/ui/label";
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
import { useParams } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

type Client = paths["/tenants/{tenantID}/oauth2/clients"]["get"]["responses"][200]["content"]["application/json"]["clients"][number];

const createClientSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  redirect_uris: z.string().min(1, "At least one redirect URI is required"),
  is_public: z.boolean().default(false),
});

export default function ClientList() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  // State to show generated secret
  const [newClientSecret, setNewClientSecret] = useState<{ id: string, secret: string } | null>(null);

  const form = useForm<z.infer<typeof createClientSchema>>({
    resolver: zodResolver(createClientSchema) as any,
    defaultValues: {
      name: "",
      redirect_uris: "",
      is_public: false,
    },
  });

  const fetchClients = async () => {
    if (!tenantId) return;
    setIsLoading(true);
    // Using the manually patched GET method
    const { data, error } = await client.GET("/tenants/{tenantID}/oauth2/clients", {
      params: { path: { tenantID: tenantId } },
    });
    if (error) {
      toast.error("Failed to load clients");
    } else if (data && data.clients) {
      setClients(data.clients);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, [tenantId]);

  const onSubmit = async (values: z.infer<typeof createClientSchema>) => {
    if (!tenantId) return;

    // Split redirect URIs by comma or newline
    const uris = values.redirect_uris.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);

    const { data, error } = await client.POST("/tenants/{tenantID}/oauth2/clients", {
      params: { path: { tenantID: tenantId } },
      body: {
        client_name: values.name, // Mapped to client_name
        redirect_uris: uris,
        type: values.is_public ? "public" : "confidential",
      },
    });

    if (error) {
      toast.error("Failed to create client");
      return;
    }

    toast.success(`Client ${data.client_id} created successfully`);
    // If confidential, show secret
    if (data.client_secret) {
      setNewClientSecret({ id: data.client_id!, secret: data.client_secret });
    } else {
      setIsCreateOpen(false);
    }
    form.reset();
    fetchClients();
  };

  const handleDelete = async (clientId: string) => {
    if (!tenantId) return;
    if (!confirm("Are you sure you want to delete this client?")) return;

    const { error } = await client.DELETE("/tenants/{tenantID}/oauth2/clients/{clientID}", {
      params: { path: { tenantID: tenantId, clientID: clientId } },
    });

    if (error) {
      toast.error("Failed to delete client");
      return;
    }
    toast.success("Client deleted");
    fetchClients();
  };

  if (!tenantId) return <div>Invalid Tenant ID</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">OAuth2 Clients</h2>
          <p className="text-muted-foreground">
            Manage applications and API credentials.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open: boolean) => {
          if (!open) setNewClientSecret(null); // Clear secret when closing
          setIsCreateOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Register Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            {newClientSecret ? (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Client Created</DialogTitle>
                  <DialogDescription>
                    Please copy your client secret now. It will not be shown again.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <div className="flex items-center space-x-2">
                    <Input value={newClientSecret.id} readOnly />
                    <Button size="icon" variant="ghost" onClick={() => {
                      navigator.clipboard.writeText(newClientSecret.id);
                      toast.success("Copied ID");
                    }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Client Secret</Label>
                  <div className="flex items-center space-x-2">
                    <Input value={newClientSecret.secret} readOnly />
                    <Button size="icon" variant="ghost" onClick={() => {
                      navigator.clipboard.writeText(newClientSecret.secret);
                      toast.success("Copied Secret");
                    }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setIsCreateOpen(false)}>Done</Button>
                </DialogFooter>
              </div>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Register New Client</DialogTitle>
                  <DialogDescription>
                    Create a new OAuth2 client application.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
                    <FormField
                      control={form.control as any}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Name</FormLabel>
                          <FormControl>
                            <Input placeholder="My App" {...field} value={field.value as string} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="redirect_uris"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Redirect URIs (comma separated)</FormLabel>
                          <FormControl>
                            <Input placeholder="http://localhost:3000/callback" {...field} value={field.value as string} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="is_public"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value as boolean}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Public Client
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Check if this is a SPA or Mobile app (No client secret).
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Registering..." : "Register Client"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Client ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No clients found.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((c) => (
                <TableRow key={c.client_id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="font-mono text-xs">{c.client_id}</TableCell>
                  <TableCell>{c.type}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c.client_id!)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
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
