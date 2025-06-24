# SMTP Node.js API

A simple SMTP email delivery API with referrer whitelist protection and a CLI for whitelist management.

## Features

- **SMTP Email Delivery**: Send emails via configurable SMTP server
- **Template Support**: Dynamic parameter injection in email body
- **Referrer Protection**: Whitelist protection for controlling which domains can use the API
- **CLI Management**: Interactive CLI for managing referrer whitelist
- **CORS Support**: API can be used from any domain

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
| DEFAULT_FROM | Default sender email for /post endpoint | No (default: no-reply@intrane.fr) |
| DEFAULT_TO | Default recipient email for /post endpoint | No (default: arancibiajav@gmail.com) |
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

### Send Email with Template Support

**Endpoint**: `POST /send-email`

**Payload**:
```json
{
  "from": "sender@example.com", // Optional, uses DEFAULT_FROM env var if not provided
  "to": "recipient@example.com", // Optional, uses DEFAULT_TO env var if not provided
  "subject": "Email Subject", // Optional, uses default if not provided
  "body": "Email content with {param} placeholders", // Optional, uses default template if not provided
  "param": "Value to inject", // Any additional fields will be available for template injection
  "otherData": { "nested": "values" } // Can include any data structure
}
```

**Template Support**:
The email body supports dynamic parameter injection:
- `{paramName}` - Replaced with the value of the corresponding property in the request body
- `{body}` - Replaced with the entire request body as formatted JSON

**Example**:
If you send a POST request with body:
```json
{
  "body": "Hello {name}, your order #{orderId} is ready!",
  "name": "John",
  "orderId": "12345"
}
```

The email body will be: "Hello John, your order #12345 is ready!"

If the body contains `{body}`, it will be replaced with the entire request body as formatted JSON.

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

## CLI Features

The CLI provides the following features:

- **List all referrers**: View all referrers that have made requests to the API
- **Manage whitelist**: Select which referrers to whitelist
- **Toggle whitelist protection**: Enable or disable the whitelist protection
- **Test API endpoint**: Send a test request to the /send-email endpoint with a custom referrer

## Data Storage

Configuration and whitelist data is stored in `data/config.json`.

## Curl Example

```bash
curl -X POST "https://smtp.com/send-email" \ 
  -H "Content-Type: application/json" \
  -H "Referer: mydomain.com" \
  -d '{
    "subject": "Test Email",
    "body": "Hello {name}, this is a test email sent on {date}",
    "name": "John Doe",
    "date": "2025-06-25"
  }'
```

## Mini Admin CLI

```bash
npm run admin
```

This will open a menu with the following options:

- Start CLI in remote
- Follow logs in remote
- Deploy to remote
- Deploy domain to remote (Traefik gateway)
- Exit

### Deploy to remote

This will deploy the API to the remote reacheable server with docker compose available (docker-compose binary)

- Requires `REMOTE_HOST` to be set in .env

### Deploy domain to remote (Traefik gateway)

This will deploy the API to the remote reacheable server a coolify instance (With Traefik gateway as proxy and dynamic configurations in watch mode available)

- Requires `REMOTE_DOMAIN_HOST`, `REMOTE_SERVICE_IP`, `PUBLISHED_DOMAIN` to be set in .env

### Published domain

The published domain is the domain that will be used to access the API. It must be a domain that is accessible from the internet and available in the Traefik gateway remote server (A record pointing to the remote server IP)

## Future Improvements

- Web interface for managing whitelist
- Web interface for viewing email logs from both whitelisted and non-whitelisted referrers (with filtering options)
- Web interface for configuring email logs retention period