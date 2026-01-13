#!/bin/bash
set -e

# uninstall.sh - OpenTrusty Control Panel Uninstaller
# Purpose: Removes the Control Panel static files and configurations.

COMPONENT="control-panel"
WEB_ROOT="/var/www/opentrusty-control-panel"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }

# 1. Root check
if [ "$EUID" -ne 0 ]; then
  log_error "This script must be run as root."
  exit 1
fi

echo "Uninstalling OpenTrusty ${COMPONENT}..."
echo ""

# 2. Remove static files
if [ -d "${WEB_ROOT}" ]; then
  read -p "Do you want to remove all files in ${WEB_ROOT}? (y/N): " REMOVE_ALL
  if [[ "$REMOVE_ALL" =~ ^[Yy]$ ]]; then
    rm -rf "${WEB_ROOT}"
    log_info "Removed everything in ${WEB_ROOT}"
  else
    # Just remove the dist folder which contains the actual app
    rm -rf "${WEB_ROOT}/dist"
    log_info "Removed ${WEB_ROOT}/dist"
  fi
else
  log_info "No web directory found at ${WEB_ROOT}"
fi

# 3. Handle Caddy configuration if exists
if [ -f "/etc/caddy/sites-available/opentrusty-console.caddy" ]; then
  log_warn "Found Caddy configuration at /etc/caddy/sites-available/opentrusty-console.caddy"
  log_warn "Please manually remove or update your Caddyfile."
fi

echo ""
log_info "OpenTrusty ${COMPONENT} uninstallation complete."
