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

// Runtime configuration interface
// This configuration is loaded from /config.js at runtime

declare global {
    interface Window {
        __OPENTRUSTY_CONFIG__?: {
            API_BASE_URL?: string;
            AUTH_BASE_URL?: string;
        };
    }
}

export function getApiBaseUrl(): string {
    return window.__OPENTRUSTY_CONFIG__?.API_BASE_URL || "/api/v1";
}

export function getAuthBaseUrl(): string {
    return window.__OPENTRUSTY_CONFIG__?.AUTH_BASE_URL || "/auth";
}
