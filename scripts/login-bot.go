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

package main

import (
	"fmt"
	"io"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"os"
	"strings"
	"time"
)

func main() {
	if len(os.Args) < 3 {
		fatal("Usage: login-bot <email> <password> [start_url]")
	}
	email := os.Args[1]
	password := os.Args[2]
	startURL := "http://localhost:8082/login"
	if len(os.Args) > 3 {
		startURL = os.Args[3]
	}

	jar, _ := cookiejar.New(nil)
	client := &http.Client{
		Jar:     jar,
		Timeout: 10 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			// fmt.Printf("DEBUG: Redirecting to: %s\n", req.URL)
			return nil
		},
	}

	fmt.Printf("1. Starting flow at %s\n", startURL)

	// 1. GET Start URL (Redirects to Auth)
	resp, err := client.Get(startURL)
	if err != nil {
		fatal("Failed to get start URL: %v", err)
	}
	defer resp.Body.Close()

	fmt.Printf("2. Landed at %s\n", resp.Request.URL)

	// 2. Handle Login
	// We expect to be at /login (Auth Server)
	if strings.Contains(resp.Request.URL.Path, "/login") {
		fmt.Println("   - Detected Login Page. Posting credentials...")

		loginAction := resp.Request.URL.String()

		// The return_to is usually in query param. The auth handler posts to the same URL.
		values := url.Values{
			"email":    {email},
			"password": {password},
		}

		resp2, err := client.PostForm(loginAction, values)
		if err != nil {
			fatal("Login POST failed: %v", err)
		}
		resp.Body.Close() // Close previous
		resp = resp2
		// Don't defer resp2 close here, we reassign resp

		fmt.Printf("3. Post Login ended at: %s\n", resp.Request.URL)
	}

	// 3. Handle Consent
	// We might be at /consent
	if strings.Contains(resp.Request.URL.Path, "/consent") {
		fmt.Println("   - Detected Consent Page. Approving...")

		// The template logic submits all query params as hidden fields + consent=approve
		values := resp.Request.URL.Query()
		values.Set("consent", "approve")

		consentUrl, _ := resp.Request.URL.Parse("/consent")

		resp3, err := client.PostForm(consentUrl.String(), values)
		if err != nil {
			fatal("Consent POST failed: %v", err)
		}
		resp.Body.Close()
		resp = resp3

		fmt.Printf("4. Post Consent ended at: %s\n", resp.Request.URL)
	}
	defer resp.Body.Close()

	// 4. Verify Success
	// Should be at Demo App Callback or Home
	// Demo App displays "Login Successful!"

	bodyBytes, _ := io.ReadAll(resp.Body)
	body := string(bodyBytes)

	if strings.Contains(body, "Login Successful") {
		fmt.Println("=== SUCCESS: OIDC Flow Completed ===")
		// Print ID Token from body if manageable
		// The demo app prints: <h3>ID Token (Raw):</h3> <pre ...>%s</pre>
		// We won't parse it, just confirmation is enough.
	} else {
		fmt.Printf("FAILURE: Did not see success message.\nURL: %s\nBody Preview:\n%s\n", resp.Request.URL, body[:min(len(body), 500)])
		os.Exit(1)
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func fatal(format string, args ...any) {
	fmt.Printf("ERROR: "+format+"\n", args...)
	os.Exit(1)
}
