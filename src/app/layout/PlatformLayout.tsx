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

import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function PlatformLayout() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white">
                <div className="p-4">
                    <h1 className="text-xl font-bold">OpenTrusty Platform</h1>
                </div>

                <nav className="mt-8">
                    <Link
                        to="/platform/admins"
                        className="block px-4 py-2 hover:bg-gray-800"
                    >
                        Platform Admins
                    </Link>
                    <Link
                        to="/platform/tenants"
                        className="block px-4 py-2 hover:bg-gray-800"
                    >
                        Tenants
                    </Link>
                    <Link
                        to="/platform/audit"
                        className="block px-4 py-2 hover:bg-gray-800"
                    >
                        Audit Logs
                    </Link>
                    <Link
                        to="/platform/settings"
                        className="block px-4 py-2 hover:bg-gray-800"
                    >
                        System Settings
                    </Link>
                </nav>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Top bar */}
                <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Platform Administration</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm">{user?.email}</span>
                        <button
                            onClick={() => logout()}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
