# OpenTrusty Control Panel Makefile

.PHONY: build test e2e clean install dev

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
	rm -rf dist node_modules artifacts/tests/ui playwright-report test-results
	rm -f .e2e-*.json
