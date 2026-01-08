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

import { Settings, ExternalLink } from "lucide-react";

export default function SystemSettings() {
    // These would ideally come from a discovery endpoint or config API
    const settings = {
        issuer: window.location.origin.replace('console', 'auth'), // Assumption based on docs
        discoveryPath: "/.well-known/openid-configuration",
        jwksPath: "/oauth2/jwks",
        version: "1.0.0-beta",
        sessionLifetime: "24h",
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
                <Settings className="h-8 w-8 text-gray-600" />
                <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Endpoints</h3>
                        <p className="text-sm text-gray-500">Core OAuth2/OIDC service endpoints.</p>

                        <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Issuer URL</dt>
                                <dd className="mt-1 flex items-center gap-2 text-sm text-gray-900 bg-gray-50 p-2 rounded border font-mono">
                                    {settings.issuer}
                                    <a href={`${settings.issuer}${settings.discoveryPath}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800">
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </dd>
                            </div>
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Discovery Endpoint</dt>
                                <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded border font-mono">
                                    {settings.discoveryPath}
                                </dd>
                            </div>
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">JWKS Endpoint</dt>
                                <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded border font-mono">
                                    {settings.jwksPath}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900">Security Configuration</h3>
                        <p className="text-sm text-gray-500">Global security parameters (Read-only).</p>

                        <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Version</dt>
                                <dd className="mt-1 text-sm text-gray-900">{settings.version}</dd>
                            </div>
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Default Session Lifetime</dt>
                                <dd className="mt-1 text-sm text-gray-900">{settings.sessionLifetime}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Configuration editing is disabled in MVP. Changes must be made via environment variables on the backend.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
