# Medverse Firebase Backend Test

This project implements a backend for managing training sessions using Firebase Cloud Functions (v2) and Firestore.

It demonstrates:
- Strongly typed TypeScript API
- Firestore-backed persistence
- Input validation and error handling
- Local development with Firebase Emulators
- Unit, integration, and HTTP integration testing

## Requirements

- Node.js 18+ (tested on Node 24)
- Java 21 (required for Firestore Emulator)

## Install

From the repository root:

```bash
npm install
```

## Local Development

Start Cloud Functions and Firestore emulators:

```bash
npm run serve
```

This starts:
- Cloud Functions (HTTP endpoints)
- Firestore Emulator
- Emulator UI

## Build

```bash
npm run build
```


## Authentication

All HTTP endpoints require an API key.

Set it as an environment variable before running locally:

```bash
export MEDVERSE_API_KEY=your_api_key_here
```

Include it in every request as a header:

```
x-api-key: your_api_key_here
```

Example:

```bash
curl -X POST http://localhost:5001/{project-id}/us-central1/createSession \
  -H "Content-Type: application/json" \
  -H "x-api-key: $MEDVERSE_API_KEY" \
  -d '{ "region": "eu-central" }'
```

## API Key

This API is protected by an API key.

### Set the API key

Create a `.env` file in `functions/`:

```bash
MEDVERSE_API_KEY=your_api_key_here
```

### Use the API key

Include the key in every request:

- Header: `x-api-key: <your_api_key_here>`


## API Endpoints

### Create Session
POST /createSession

Body:
```json
{
  "region": "eu-central"
}
```

### Get Session
GET /getSession?sessionId=abc123

### Update Session Status
PATCH /updateSessionStatus

Body:
```json
{
  "sessionId": "abc123",
  "status": "active"
}
```

### List Sessions
```
GET /listSessions?status=active
GET /listSessions?region=eu-central
GET /listSessions?limit=10
```

Rules:
- You may provide either status or region

## Testing

Unit tests:
```bash
npm run test
```

Watch tests:
```bash
npm run test:watch
```

Firestore tests:
```bash
npm run test:firestore
```

Emulator tests:
```bash
npm run test:emulators
```


## Firestore Security

Firestore rules deny all client access:
```
allow read, write: if false;
```

Only Cloud Functions can access the database.

## Deployment

```bash
npm run deploy
```

## Architecture

The project is layered:
- Handlers (HTTP)
- Validators
- Services
- Repositories
