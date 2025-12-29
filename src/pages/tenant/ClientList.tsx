import { useState, useEffect } from "react";
import { oauthClientApi } from "../../app/api/oauthClientApi";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import type { paths } from "../../api/generated/schema";
import { toast } from "sonner";
import { useParams, Link } from "react-router-dom";

type Client = paths["/tenants/{tenantID}/oauth2/clients"]["get"]["responses"][200]["content"]["application/json"]["clients"][number];

export default function ClientList() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = async () => {
    if (!tenantId) return;
    setIsLoading(true);
    try {
      const data = await oauthClientApi.list(tenantId);
      if (data && data.clients) {
        setClients(data.clients);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load clients");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, [tenantId]);

  const handleDelete = async (clientId: string) => {
    if (!tenantId) return;
    if (!confirm("Are you sure you want to delete this client?")) return;

    try {
      await oauthClientApi.delete(tenantId, clientId);
      toast.success("Client deleted");
      fetchClients();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete client");
    }
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
        <Button asChild>
          <Link to={`/tenant/${tenantId}/clients/new`}>
            <Plus className="mr-2 h-4 w-4" /> Register Client
          </Link>
        </Button>
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
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/tenant/${tenantId}/clients/${c.client_id}`}>
                        View
                      </Link>
                    </Button>
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
