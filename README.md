# ARC Inventory

ARC Inventory is a browser-based loadout planner for *ARC Raiders*. It lets players build and save loadouts in a UI that mirrors the in-game inventory grid.

Created for IT 718 at the University of New Hampshire
## Stack

- Frontend: React + Vite
- Hosting: Firebase Hosting
- Backend: Cloud Functions
- API: API Gateway
- User data: Firestore
- Item cache: Cloud Storage
- Auth: Google Sign-In with backend-issued app session

## Project Structure

```text
frontend/     React single page app (SPA)
functions/    Backend, serverless functions, written in Node.js 24
infra/        Cloud Build and API Gateway config (.yaml)
arcraiders-data/  Community sourced data, synced periodically as game updates release
```

## Functions:

- `fn-inventory`
  Handles user login, session creation and deletion

- `fn-items`
  Serves cached item data.

- `fn-item-sync`
  Pulls item data from the community repo and refreshes the cache.

## Local Development

Install frontend dependencies:

```bash
cd frontend
npm install
```

Run the frontend dev server:

```bash
npm run dev
```

## Deployment
An automated script will deploy both the frontend and backend.
Usage:
```bash
./deploy.sh
```
## Notes:

This is a fan-made project. All credit goes to Arc Raiders and Embark Studios.
Community data is supported by RaidTheory (https://github.com/RaidTheory/arcraiders-data)
