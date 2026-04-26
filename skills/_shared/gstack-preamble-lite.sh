#!/bin/bash
# Lightweight Preamble for claude-enterprise-starter
# Replaces GStack's full preamble (bin/ scripts, telemetry, learnings, etc.)
# This file is referenced by all GStack-derived skills.

_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "BRANCH: $_BRANCH"

_SESSION_DIR="$HOME/.claude-enterprise/sessions"
mkdir -p "$_SESSION_DIR" 2>/dev/null || true
touch "$_SESSION_DIR/$PPID" 2>/dev/null || true
_SESSIONS=$(find "$_SESSION_DIR" -mmin -120 -type f 2>/dev/null | wc -l | tr -d ' ')
find "$_SESSION_DIR" -mmin +120 -type f -exec rm {} + 2>/dev/null || true
echo "SESSIONS: $_SESSIONS"

_REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
_SLUG=$(basename "$_REPO_ROOT" 2>/dev/null || echo "unknown")
echo "SLUG: $_SLUG"
