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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
      // Optimistic refresh
      setClients(prev => prev.filter(c => c.client_id !== clientId));
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
        <RegisterClientDialog fetchClients={fetchClients} />
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
                  <TableCell className="font-medium">{c.client_name || "Unnamed"}</TableCell>
                  <TableCell className="font-mono text-xs">{c.client_id}</TableCell>
                  <TableCell>{c.token_endpoint_auth_method === "none" ? "Public" : "Confidential"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/tenant/${tenantId}/clients/${c.client_id}`}>
                        View
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => (c.client_id && handleDelete(c.client_id))}>
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

function RegisterClientDialog({ fetchClients }: { fetchClients: () => void }) {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [loading, setLoading] = useState(false);
  const [creationResult, setCreationResult] = useState<{ clientId: string; clientSecret: string } | null>(null);

  const handleRegister = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await oauthClientApi.create(tenantId, {
        client_name: name,
        redirect_uris: [redirectUri],
        allowed_scopes: ["openid", "profile", "email"],
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        token_endpoint_auth_method: "client_secret_basic",
      });
      setCreationResult({
        clientId: res.client.client_id,
        clientSecret: res.client_secret,
      });
      toast.success("Client registered!");
      fetchClients();
    } catch (err: any) {
      toast.error(err.message || "Failed to register client");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setIsOpen(false);
    setCreationResult(null);
    setName("");
    setRedirectUri("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Register Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register Client</DialogTitle>
        </DialogHeader>

        {!creationResult ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="client-name" className="text-sm font-medium">Client Name</label>
              <input
                id="client-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Application"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="redirect-uri" className="text-sm font-medium">Redirect URI</label>
              <input
                id="redirect-uri"
                value={redirectUri}
                onChange={(e) => setRedirectUri(e.target.value)}
                placeholder="https://app.com/callback"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <Button onClick={handleRegister} disabled={loading || !name || !redirectUri}>
              {loading ? "Registering..." : "Register Client"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="p-3 bg-green-50 text-green-700 text-sm rounded border border-green-200">
              Created successfully! Copy the credentials below.
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Client ID</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  readOnly
                  aria-label="Client ID"
                  value={creationResult.clientId}
                  className="flex-1 block w-full rounded-md sm:text-sm border-gray-300 bg-gray-50 p-2 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Secret</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  readOnly
                  aria-label="Client Secret"
                  value={creationResult.clientSecret}
                  className="flex-1 block w-full rounded-md sm:text-sm border-gray-300 bg-red-50 p-2 font-mono text-red-700"
                />
              </div>
              <p className="text-[10px] text-red-500 mt-1">Warning: This secret will only be shown once.</p>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={reset}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
