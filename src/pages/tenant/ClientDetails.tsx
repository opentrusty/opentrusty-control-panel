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
import { useParams, Link } from "react-router-dom";
import { oauthClientApi } from "../../app/api/oauthClientApi";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Copy, Key, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { paths } from "../../api/generated/schema";

type Client = paths["/tenants/{tenantID}/oauth2/clients/{clientID}"]["get"]["responses"][200]["content"]["application/json"];

export default function ClientDetails() {
    const { tenantId, clientId } = useParams<{ tenantId: string; clientId: string }>();
    const [oauthClient, setOauthClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchClient = useCallback(async () => {
        if (!tenantId || !clientId) return;
        setIsLoading(true);
        try {
            const data = await oauthClientApi.get(tenantId, clientId);
            // The API returns the object directly
            setOauthClient(data as unknown as Client);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load client details");
        }
        setIsLoading(false);
    }, [tenantId, clientId]);

    useEffect(() => {
        const load = async () => {
            await fetchClient();
        };
        load();
    }, [fetchClient]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    if (isLoading) return <div className="p-8 text-center uppercase tracking-widest text-gray-500 animate-pulse">Loading Client Details...</div>;
    if (!oauthClient) return <div className="p-8 text-center text-red-500">Client Not Found</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                    <Link to={`/tenant/${tenantId}/clients`}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">{oauthClient.name}</h2>
                    <p className="text-sm text-gray-400 font-mono">{oauthClient.client_id}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-lg border-2 border-gray-100">
                    <CardHeader className="bg-gray-50 border-b">
                        <CardTitle className="flex items-center gap-2 text-gray-800">
                            <ShieldCheck className="h-5 w-5 text-blue-600" />
                            Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Redirect URIs</label>
                            <div className="mt-2 space-y-1">
                                {oauthClient.redirect_uris?.map((uri: string) => (
                                    <div key={uri} className="bg-gray-50 p-2 rounded border font-mono text-sm break-all">
                                        {uri}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Allowed Scopes</label>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {oauthClient.allowed_scopes?.map((scope: string) => (
                                    <span key={scope} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold border border-blue-100 uppercase">
                                        {scope}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-2 border-gray-100">
                    <CardHeader className="bg-gray-50 border-b">
                        <CardTitle className="flex items-center gap-2 text-gray-800">
                            <Key className="h-5 w-5 text-amber-500" />
                            Credentials
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Client ID</label>
                            <div className="mt-2 flex items-center gap-2">
                                <code className="bg-gray-100 p-2 rounded flex-1 font-mono text-xs overflow-hidden text-ellipsis">{oauthClient.client_id}</code>
                                <Button size="icon" variant="ghost" onClick={() => copyToClipboard(oauthClient.client_id!)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Auth Method</label>
                            <p className="mt-1 text-sm font-medium text-gray-700 capitalize">
                                {oauthClient.token_endpoint_auth_method?.replace(/_/g, " ")}
                            </p>
                        </div>
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-3 mt-4">
                            <p className="text-xs text-amber-800">
                                Client secret is only displayed during creation. If you've lost it, you must regenerate it.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
