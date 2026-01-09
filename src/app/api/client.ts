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

// Core API client with centralized error handling
// Core API client with centralized error handling

export class ApiError extends Error {
  status: number;
  statusText: string;
  data?: unknown;

  constructor(status: number, statusText: string, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

export class UnauthorizedError extends ApiError {
  constructor() {
    super(401, "Unauthorized", "Session expired or invalid");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = "You do not have permission to access this resource") {
    super(403, "Forbidden", message);
    this.name = "ForbiddenError";
  }
}

interface FetchOptions extends RequestInit {
  baseUrl?: string;
}

import { getApiBaseUrl } from "../config";

class ApiClient {
  private baseUrl: string;
  private onUnauthorized?: () => void;

  constructor(baseUrl: string = getApiBaseUrl()) {
    this.baseUrl = baseUrl;
  }

  setUnauthorizedHandler(handler: () => void) {
    this.onUnauthorized = handler;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      if (this.onUnauthorized) {
        this.onUnauthorized();
      }
      throw new UnauthorizedError();
    }

    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      throw new ForbiddenError(errorData.error || errorData.message);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        response.statusText,
        errorData.error || errorData.message || `HTTP ${response.status}`,
        errorData
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(path: string, options?: FetchOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": "test-token",
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": "test-token",
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": "test-token",
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(path: string, options?: FetchOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": "test-token",
      },
      ...options,
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();
