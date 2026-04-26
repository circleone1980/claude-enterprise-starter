---
name: qa
version: 1.0.0
effort: high
description: |
  Browser-based real testing using Playwright MCP. Runs actual browser tests:
  navigation, clicks, form fills, visual regression, accessibility checks.
  Never reads source code — tests as a user, not a developer.
  Modes: full (default), quick (--quick, 30s smoke), diff-aware (auto on feature branch).
  Use when asked to "browser test", "visual test", "real QA", "test in browser",
  "does this work", or "QA the site".
  Proactively suggest when the user has a running dev server and wants to verify features.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
  - mcp__plugin_ecc_playwright__browser_navigate
  - mcp__plugin_ecc_playwright__browser_click
  - mcp__plugin_ecc_playwright__browser_type
  - mcp__plugin_ecc_playwright__browser_snapshot
  - mcp__plugin_ecc_playwright__browser_take_screenshot
  - mcp__plugin_ecc_playwright__browser_evaluate
  - mcp__plugin_ecc_playwright__browser_fill_form
  - mcp__plugin_ecc_playwright__browser_select_option
  - mcp__plugin_ecc_playwright__browser_press_key
  - mcp__plugin_ecc_playwright__browser_wait_for
  - mcp__plugin_ecc_playwright__browser_hover
  - mcp__plugin_ecc_playwright__browser_tabs
  - mcp__plugin_ecc_playwright__browser_close
  - mcp__plugin_ecc_playwright__browser_console_messages
  - mcp__plugin_ecc_playwright__browser_network_requests
origin: custom (based on gstack/qa v2.0.0, MIT license)
---

# QA — Browser-Based Real Testing

> Tests your app as a real user. Finds bugs, documents evidence, proposes fixes.
> **Core rule: Never read source code. Test as a user, not a developer.**

## Preamble (run first)

```bash
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
```

> **Note**: This skill is self-contained — no external GStack installation required.

## Quick Reference

| Command | Mode | Description |
|---------|------|-------------|
| `/qa` | full | Systematic exploration of every reachable page |
| `/qa --quick` | quick | 30-second smoke test of critical paths |
| `/qa --diff` | diff-aware | Test only files changed on this branch |
| `/qa http://localhost:3000` | full | Test specific URL |

## Health Score Rubric

| Dimension | Weight | What to check |
|-----------|--------|---------------|
| Console Errors | 15% | No JS errors, no unhandled promise rejections |
| Navigation | 10% | All links work, no 404s, back/forward works |
| Visual | 10% | No layout breaks, no overflow, responsive |
| Functional | 20% | Forms submit, buttons work, data persists |
| UX | 15% | Loading states, error messages, feedback |
| Performance | 10% | Page load < 3s, no layout shifts |
| Content | 5% | No typos, no lorem ipsum, no placeholder text |
| Accessibility | 15% | Keyboard nav, ARIA labels, contrast ratio |

## Phase 1: Initialize

1. Ask the user for the URL to test (or detect from `package.json` / dev server)
2. Determine test mode (full / quick / diff-aware)
3. Create output directory: `docs/test/qa-reports/`
4. Initialize report template:

```markdown
# QA Report — {date}

**URL**: {url}
**Mode**: {mode}
**Branch**: {branch}
**Browser**: Chromium (Playwright)

## Summary

- **Health Score**: X/100
- **Bugs Found**: N
- **Critical**: N | **High**: N | **Medium**: N | **Low**: N

## Bugs

### Bug #1: {title}
- **Severity**: Critical/High/Medium/Low
- **Page**: {url}
- **Steps to reproduce**: ...
- **Expected**: ...
- **Actual**: ...
- **Evidence**: screenshot

## Per-Page Results

### /path
- Console: ✅/❌
- Visual: ✅/❌
- Functional: ✅/❌
- Accessibility: ✅/❌
```

## Phase 2: Authenticate (if needed)

1. Navigate to the URL
2. Take initial screenshot
3. If login page detected:
   - Ask user for credentials or use `browser_fill_form`
   - Handle login flow
   - Verify successful authentication
4. If cookie-based auth needed:
   - Ask user to provide cookies
   - Use `browser_evaluate` to set cookies

## Phase 3: Orient

1. Take accessibility snapshot of the landing page
2. Map the application structure:
   - Identify navigation menu items
   - Find all internal links
   - Detect framework (React, Vue, etc.) via console
3. Build a sitemap of reachable pages

## Phase 4: Explore (per page)

For each page in the sitemap:

### 4.1 Visual Check
- Take full-page screenshot
- Check for layout breaks, overflow, overlapping elements
- Verify responsive behavior (resize to 375px, 768px, 1440px)

### 4.2 Interactive Check
- Click all buttons → verify response (navigation, modal, state change)
- Fill all forms → verify validation and submission
- Test all dropdowns → verify options load
- Test all modals → verify open/close/escape
- Test all toggles → verify state changes

### 4.3 Navigation Check
- Click all links → verify no 404s
- Test browser back/forward → verify state preserved
- Test deep links → verify direct access works

### 4.4 Console Check
- Check console messages for errors and warnings
- Network requests for failed calls (4xx, 5xx)
- No unhandled promise rejections

### 4.5 Accessibility Check
- Take accessibility snapshot
- Verify ARIA labels on interactive elements
- Check keyboard navigation (Tab through focusable elements)
- Check color contrast on text elements

### 4.6 Edge Case Check
- Empty states (no data)
- Error states (network failure)
- Loading states (skeleton screens)
- Long content (overflow, truncation)

## Phase 5: Document

For each bug found:

1. **Interactive bugs**: Take before/after screenshots showing the issue
2. **Visual bugs**: Take screenshot highlighting the problem
3. **Console bugs**: Save console messages showing the error
4. **Network bugs**: Save failed request details

Evidence saved to `docs/test/qa-reports/{date}/`:
- `bug-{N}-{description}.png` — screenshot evidence
- `console-errors.txt` — captured console errors
- `network-errors.txt` — captured failed requests

## Phase 6: Wrap Up

1. Calculate health score per the rubric above
2. Generate summary statistics
3. Create baseline file for regression testing:

```json
{
  "date": "{date}",
  "url": "{url}",
  "healthScore": X,
  "pages": ["/", "/about", "/contact"],
  "bugs": {"critical": N, "high": N, "medium": N, "low": N},
  "screenshots": {"total": N}
}
```

Save to `docs/test/qa-reports/baseline.json`.

## Phase 7: Triage

Sort bugs by severity:

| Severity | Criteria | Action |
|----------|----------|--------|
| **Critical** | App broken, data loss, security issue | Must fix immediately |
| **High** | Major feature broken, bad UX | Must fix before release |
| **Medium** | Minor feature issue, workaround exists | Should fix |
| **Low** | Cosmetic, edge case, polish | Nice to have |

Filter: Critical + High bugs must all be addressed. Medium + Low are optional.

## Phase 8: Fix Loop (optional)

If user requests fixes:

1. Fix one bug at a time
2. Each fix gets an atomic commit: `fix(qa): {bug description}`
3. After each fix, re-verify the specific bug
4. Continue until all Critical + High bugs are fixed

## Phase 9: Final QA

After fixes are applied:

1. Re-run the full test suite
2. Verify no regressions introduced
3. Update the report with final scores

## Phase 10: Report

Present the final report to the user:

```
QA Complete — {date}
━━━━━━━━━━━━━━━━━━━━
Health Score: {before} → {after}
Bugs: {total} found, {fixed} fixed, {remaining} remaining
  Critical: {N} (all fixed ✅)
  High: {N} ({fixed} fixed, {remaining} remaining)
  Medium: {N}
  Low: {N}

Full report: docs/test/qa-reports/{date}/report.md
```

## Important Rules

1. **Never read source code** — you are a user, not a developer
2. **Take screenshots** of every bug — visual evidence is critical
3. **One bug per report entry** — don't combine issues
4. **Be specific** — include exact URLs, button labels, form fields
5. **Test on all viewports** — mobile (375px), tablet (768px), desktop (1440px)
6. **Don't skip pages** — if it's reachable, test it
7. **Document console errors** — even if they seem harmless
8. **Accessibility matters** — keyboard nav and ARIA are not optional
