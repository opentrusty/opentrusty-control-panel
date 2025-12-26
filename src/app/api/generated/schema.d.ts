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
