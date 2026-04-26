# ARC Inventory

ARC Inventory is a browser-based loadout planner for *ARC Raiders*. It lets players build and save loadouts in a UI that mirrors the in-game inventory grid.

## Stack

- Frontend: React + Vite
- Hosting: Firebase Hosting
- Backend: Google Cloud Functions Gen 2
- API: API Gateway
- User data: Firestore
- Item cache: Cloud Storage
- Auth: Google Sign-In with backend-issued app session

## Project Structure

```text
frontend/     React app
functions/    Backend functions
infra/        Cloud Build and API Gateway config
arcraiders-data/  Local game data source used by the sync pipeline
```

## Main Services

- `fn-inventory`
  Handles login verification, session creation, logout, and loadout CRUD.

- `fn-items`
  Serves cached item data.

- `fn-item-sync`
  Pulls item data from the RaidTheory dataset and refreshes the cache.

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
