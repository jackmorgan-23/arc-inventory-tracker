# ARC Inventory

ARC Inventory is a browser-based loadout planner for *ARC Raiders*. It lets players build and save loadouts in a UI that mirrors the in-game inventory grid.

<<<<<<< HEAD
=======
Created for IT 718 at the University of New Hampshire
>>>>>>> 6ded98b5bc96d903baf7941b514d18ada7485071
## Stack

- Frontend: React + Vite
- Hosting: Firebase Hosting
<<<<<<< HEAD
- Backend: Google Cloud Functions Gen 2
=======
- Backend: Cloud Functions
>>>>>>> 6ded98b5bc96d903baf7941b514d18ada7485071
- API: API Gateway
- User data: Firestore
- Item cache: Cloud Storage
- Auth: Google Sign-In with backend-issued app session

## Project Structure

```text
<<<<<<< HEAD
frontend/     React app
functions/    Backend functions
infra/        Cloud Build and API Gateway config
arcraiders-data/  Local game data source used by the sync pipeline
```

## Main Services

- `fn-inventory`
  Handles login verification, session creation, logout, and loadout CRUD.
=======
frontend/     React single page app (SPA)
functions/    Backend, serverless functions, written in Node.js 24
infra/        Cloud Build and API Gateway config (.yaml)
arcraiders-data/  Community sourced data, synced periodically as game updates release
```

## Functions:

- `fn-inventory`
  Handles user login, session creation and deletion
>>>>>>> 6ded98b5bc96d903baf7941b514d18ada7485071

- `fn-items`
  Serves cached item data.

- `fn-item-sync`
<<<<<<< HEAD
  Pulls item data from the RaidTheory dataset and refreshes the cache.
=======
  Pulls item data from the community repo and refreshes the cache.
>>>>>>> 6ded98b5bc96d903baf7941b514d18ada7485071

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

<<<<<<< HEAD
The app uses deployed backend endpoints during local development.

## Deployment

Deploy backend infrastructure and API config:

```bash
./deploy.sh
```

The deploy script also runs Firebase Hosting deploy for the frontend.

## Notes

- `arcraiders-data/` is tracked as normal project content, not as a Git submodule.
- Firebase and Codex local tooling files are ignored in `.gitignore`.
=======
## Deployment
An automated script will deploy both the frontend and backend.
Usage:
```bash
./deploy.sh
```
## Notes:

This is a fan-made project. All credit goes to Arc Raiders and Embark Studios.
Community data is supported by RaidTheory (https://github.com/RaidTheory/arcraiders-data)
>>>>>>> 6ded98b5bc96d903baf7941b514d18ada7485071
