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

// Stub OpenAPI schema until backend schema is regenerated
// Stub OpenAPI schema until backend schema is regenerated

export interface paths {
    "/auth/login": {
        post: {
            requestBody: {
                content: {
                    "application/json": {
                        email: string;
                        password: string;
                    };
                };
            };
            responses: {
                200: {
                    content: {
                        "application/json": {
                            user_id: string;
                            email: string;
                        };
                    };
                };
            };
        };
    };
    "/auth/me": {
        get: {
            responses: {
                200: {
                    content: {
                        "application/json": {
                            user: {
                                id: string;
                                email: string;
                                email_verified: boolean;
                                profile?: {
                                    given_name?: string;
                                    family_name?: string;
                                    full_name?: string;
                                };
                            };
                            role_assignments?: Array<{
                                role_id: string;
                                role_name: string;
                                scope: string;
                                scope_context_id?: string;
                            }>;
                        };
                    };
                };
            };
        };
    };
    "/auth/logout": {
        post: {
            responses: {
                200: {
                    content: {
                        "application/json": {
                            message: string;
                        };
                    };
                };
            };
        };
    };
}
