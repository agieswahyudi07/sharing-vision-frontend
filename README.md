# Sharing Vision - Vue Frontend

This is the frontend dashboard for the Sharing Vision recruitment test, built with **Vue 3**, **Vite**, and **TypeScript**. It connects to the Go Gin backend API to manage and display articles.

## Features
- **Modern Dark Glassmorphism UI**: Built with a sleek custom CSS system including micro-interactions, responsive sidebar navigation, and card-based post previews.
- **Tabbed Post Dashboard**: Categorizes posts into *Published*, *Drafts*, and *Trashed* tabs in a clean tabular view.
- **Interactive Character Validators**: Add and Edit forms display visual feedback and counter badges verifying:
  - Title: Minimum 20 characters
  - Content: Minimum 200 characters
  - Category: Minimum 3 characters
- **Reader Blog Preview & Pagination**: Grid page layout displaying only `publish` status articles, complete with dynamic previous/next controls using backend paginated endpoints.
- **Global Toast Alert System**: Centralized popup alerts for actions (saving, trash, deleting, network errors).
- **Dynamic Configured API**: The API URL is centralized in `src/config.ts` and can be set dynamically via `.env` variables.

## Requirements
- Node.js 18+ (tested on Node 22+)
- NPM

## Quickstart

1. **Environment Setup**:
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Modify `VITE_API_URL` if your Go server is running on a port other than `8080`.

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173/` to view the application.

## Running with Docker Compose

You can build and run the Vue 3 frontend using Docker Compose:

```bash
docker compose up -d --build
```

- **Vue Frontend Dashboard**: Accessible at `http://localhost:5173/`.
- To stop the service:
  ```bash
  docker compose down
  ```
