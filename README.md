# SMTP Node.js API

A simple SMTP email delivery API with referrer whitelist protection and a CLI for whitelist management.

## Features

- **SMTP Email Delivery**: Send emails via configurable SMTP server
- **Referrer Protection**: Whitelist protection for controlling which domains can use the API
- **CLI Management**: Interactive CLI for managing referrer whitelist

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
4. Edit the `.env` file with your SMTP server details

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| SMTP_HOST | SMTP server hostname | Yes |
| SMTP_PORT | SMTP server port | Yes |
| SMTP_SECURE | Whether to use TLS (true/false) | Yes |
| SMTP_USER | SMTP username | No |
| SMTP_PASS | SMTP password | No |
| PORT | API server port | No (default: 3000) |

## Usage

### Starting the API Server

```
npm start
```

### Using the CLI for Whitelist Management

```
npm run cli
```

## API Endpoints

### Send Email

**Endpoint**: `POST /send-email`

**Payload**:
```json
{
  "from": "sender@example.com",
  "to": "recipient@example.com", // Can also be an array of emails
  "subject": "Email Subject",
  "body": "Email content in plain text or HTML"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "messageId": "message-id-from-smtp-server"
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Health Check

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "ok"
}
```

## Referrer Whitelist Protection

The API tracks all referrers that make requests and allows you to whitelist specific domains using the CLI. When whitelist protection is enabled, only requests from whitelisted referrers will be processed.

## Data Storage

Configuration and whitelist data is stored in `data/config.json`.
