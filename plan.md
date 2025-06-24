# SMTP Node.js API Plan

## Overview
Build a simple SMTP email delivery API with no authentication, configurable SMTP settings, and a referrer whitelist protection managed via a CLI.

---

## Features

### 1. SMTP Configuration
- Use environment variables loaded via `dotenv` for SMTP settings:
  - SMTP_HOST
  - SMTP_PORT
  - SMTP_SECURE (boolean)
  - SMTP_USER (optional)
  - SMTP_PASS (optional)

### 2. Email Delivery API Endpoint
- HTTP POST `/send-email`
- Accept JSON payload with required fields:
  - `from` (string, email address)
  - `to` (string or array of emails)
  - `subject` (string)
  - `body` (string, can be raw text or HTML)
- Validate payload for required fields
- Deliver email using SMTP settings

### 3. Referrer Whitelist Protection
- Infer and log `Referer` header values from incoming requests
- Store list of unique referrers in `data/config.json`
- Allow enabling/disabling whitelist protection:
  - When enabled, reject requests with non-whitelisted referrers
  - When disabled, allow all requests

### 4. CLI for Referrer Whitelist Management
- Interactive CLI menu to:
  - List all inferred referrers
  - Multi-select referrers to whitelist
  - Enable/disable whitelist protection
- Persist whitelist and protection status in `data/config.json`

---

## Data Storage

- `data/config.json` structure example:
```json
{
  "whitelistEnabled": true,
  "referrers": {
    "https://example.com": true,
    "https://another.com": false
  }
}

## Tools/Rules restriction

- Do not execute app
- Do no install any dependencies
- Do not create/execute tests