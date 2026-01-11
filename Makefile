# OpenTrusty Control Panel Makefile

.PHONY: build test e2e clean install dev release help

help:
	@echo "OpenTrusty Control Panel Makefile"
	@echo "Usage:"
	@echo "  make install     - Install dependencies"
	@echo "  make build       - Build production bundle"
	@echo "  make dev         - Start development server"
	@echo "  make test        - Run unit tests"
	@echo "  make e2e         - Run E2E tests with Playwright"
	@echo "  make release     - Build and package release tarball"
	@echo "  make clean       - Clean build artifacts"

# Install dependencies
install:
	npm ci

# Build production bundle
build: install
	npm run build

# Run unit/component tests (placeholder - no unit tests yet)
test:
	@echo "No unit tests configured. Run 'make e2e' for E2E tests."

# Run E2E tests with Playwright
e2e:
	npx playwright test --reporter=list,html

# Start development server
dev:
	npm run dev

# Clean build artifacts and test results
clean:
	rm -rf dist node_modules artifacts/tests/ui playwright-report test-results release/
	rm -f .e2e-*.json

# Release package - creates a deployment-ready tarball
VERSION ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
RELEASE_DIR = release/opentrusty-control-panel-$(VERSION)

release: build
	@echo "Creating release package for $(VERSION)..."
	@mkdir -p $(RELEASE_DIR)
	@cp -r dist $(RELEASE_DIR)/
	@cp -r deploy/* $(RELEASE_DIR)/
	@cp Caddyfile.example $(RELEASE_DIR)/
	@cp LICENSE $(RELEASE_DIR)/ 2>/dev/null || echo "No LICENSE file found"
	@cp README.md $(RELEASE_DIR)/
	@cd release && tar -czf opentrusty-control-panel-$(VERSION).tar.gz opentrusty-control-panel-$(VERSION)
	@echo "✓ Release package created: release/opentrusty-control-panel-$(VERSION).tar.gz"

