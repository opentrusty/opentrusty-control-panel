#!/bin/bash
set -e

# Configuration
DB_PORT=5434
DB_URL="postgres://opentrusty:opentrusty_test_password@localhost:$DB_PORT/opentrusty_test?sslmode=disable"
BOOTSTRAP_EMAIL="admin@platform.local"
BOOTSTRAP_PASSWORD="adminadmin"

# Unset any stale environment variables from previous runs
unset CLIENT_ID
unset CLIENT_SECRET
unset REDIRECT_URI
unset AUTH_URL

# Directories
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CORE_DIR="$REPO_ROOT/opentrusty-core"
AUTH_DIR="$REPO_ROOT/opentrusty-auth"
ADMIN_DIR="$REPO_ROOT/opentrusty-admin"
CLI_DIR="$REPO_ROOT/opentrusty-cli"
PANEL_DIR="$REPO_ROOT/opentrusty-control-panel"
BIN_DIR="/tmp/opentrusty-e2e-bin"

mkdir -p "$BIN_DIR"

cleanup() {
    echo ">>> Final Audit Logs Dump:"
    docker exec opentrusty-postgres-test psql -U opentrusty -d opentrusty_test -c "SELECT type, tenant_id, actor_id, resource FROM audit_events ORDER BY created_at DESC LIMIT 20;" || true
    echo "Stopping services..."
    pkill -P $$ || true
    lsof -t -i:8080 -i:8081 -i:8082 -i:5173 | xargs kill -9 || true
    echo "Stopping database..."
    cd "$CORE_DIR" && docker compose -f tests/docker-compose.test.yml down
}
trap cleanup EXIT

echo ">>> Resetting Test Database..."
rm -f "$PANEL_DIR"/.e2e-*.json
cd "$CORE_DIR" && docker compose -f tests/docker-compose.test.yml down -v || true
cd "$CORE_DIR" && docker compose -f tests/docker-compose.test.yml up -d --wait

echo ">>> Building Binaries..."
echo "Building CLI..."
(cd "$CLI_DIR" && go build -o "$BIN_DIR/cli" ./cmd/opentrusty)
echo "Building Authd..."
(cd "$AUTH_DIR" && go build -o "$BIN_DIR/authd" ./cmd/authd)
echo "Building Admind..."
(cd "$ADMIN_DIR" && go build -o "$BIN_DIR/admind" ./cmd/admind)

echo ">>> Initializing Database..."
export OPENTRUSTY_DB_URL="$DB_URL"
export OPENTRUSTY_IDENTITY_SECRET="this-is-a-32-character-ident-key"
"$BIN_DIR/cli" migrate

echo ">>> Bootstrapping Platform..."
export OPENTRUSTY_BOOTSTRAP_ADMIN_EMAIL="$BOOTSTRAP_EMAIL"
export OPENTRUSTY_BOOTSTRAP_ADMIN_PASSWORD="$BOOTSTRAP_PASSWORD"
"$BIN_DIR/cli" bootstrap || echo "Bootstrap failed or already done (ignoring if idempotent)"

echo ">>> Debug: rbac_roles"
docker exec opentrusty-postgres-test psql -U opentrusty -d opentrusty_test -c "SELECT * FROM rbac_roles;"
echo ">>> Debug: rbac_assignments"
docker exec opentrusty-postgres-test psql -U opentrusty -d opentrusty_test -c "SELECT user_id, role_id, scope, scope_context_id FROM rbac_assignments;"

echo ">>> Starting Backend Services..."
# Auth Service
OPENTRUSTY_PORT=8080 OPENTRUSTY_DB_URL="$DB_URL" OPENTRUSTY_IDENTITY_SECRET="this-is-a-32-character-ident-key" OPENTRUSTY_AUTH_SIGNING_KEY="this-is-a-32-character-auth-key-" "$BIN_DIR/authd" &
AUTH_PID=$!
echo "Authd running (PID $AUTH_PID)"

# Admin Service
OPENTRUSTY_PORT=8081 OPENTRUSTY_DB_URL="$DB_URL" OPENTRUSTY_IDENTITY_SECRET="this-is-a-32-character-ident-key" OPENTRUSTY_ADMIN_SIGNING_KEY="this-is-a-32-character-admin-key-" "$BIN_DIR/admind" &
ADMIN_PID=$!
echo "Admind running (PID $ADMIN_PID)"

# Wait for services
echo "Waiting for services to be ready..."
sleep 5 # simple wait for backend

echo ">>> Starting Frontend..."
cd "$PANEL_DIR" && npm run dev > "$PANEL_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "Frontend running (PID $FRONTEND_PID)"

echo "Waiting for frontend to be ready..."
# Wait for port 5173
for i in {1..30}; do
    if lsof -i :5173 > /dev/null; then
        echo "Frontend is listening on 5173"
        break
    fi
    sleep 1
done

echo ">>> Running E2E Tests (Step 1: Setup & Client)..."
cd "$PANEL_DIR"
# Pass bootstrap creds to playwright
export BOOTSTRAP_EMAIL="$BOOTSTRAP_EMAIL"
export BOOTSTRAP_PASSWORD="$BOOTSTRAP_PASSWORD"

set +e
npx playwright test tests/e2e/01-bootstrap.spec.ts tests/e2e/02-tenant.spec.ts tests/e2e/03-client.spec.ts --reporter=list
STEP1_EXIT_CODE=$?
set -e

if [ $STEP1_EXIT_CODE -ne 0 ]; then
    echo ">>> Step 1 Tests Failed!"
    exit $STEP1_EXIT_CODE
fi

echo ">>> Running E2E Tests (Step 2: OIDC Flow)..."
set +e
npx playwright test tests/e2e/04-oidc-flow-v2.spec.ts --reporter=list
TEST_EXIT_CODE=$?
set -e

echo ">>> Final Audit Logs Dump:"
docker exec opentrusty-postgres-test psql -U opentrusty -d opentrusty_test -c "SELECT type, tenant_id, actor_id, resource, created_at FROM audit_events ORDER BY created_at DESC LIMIT 20;" || true

exit $TEST_EXIT_CODE

echo ">>> Success!"
