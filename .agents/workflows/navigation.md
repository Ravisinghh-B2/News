---
description: Project Navigation and Development Workflow
---

# NewsHub Navigation Workflow

This workflow describes how to navigate, run, and understand the NewsHub project.

## 1. Project Structure Overiew
- `Frontend/`: Contains the client-side code (HTML, CSS, JS).
- `Backend/`: Contains the Node.js/Express server logic.
- `Frontend/js/api.js`: The bridge between Frontend and Backend.

## 2. Running the Application locally

### Start the Backend
1. Open a terminal in `./Backend`.
2. Run `npm install` (if first time).
3. Run `npm start` or `node server.js`.
   - The server typically runs on `http://localhost:5000`.

### Run the Frontend
1. Open `./Frontend/index.html` in a web browser.
2. Ensure the Backend is running so API calls (News fetch, Login) work.

## 3. Code Connection Workflow

### How Frontend connects to Backend:
The frontend reaches out to the backend via `js/api.js`.

- **Action**: Fetching Top News
- **Connection**: `app.js` -> `api.js` (`fetchNews`) -> Backend `routes/newsRoutes.js` -> `controllers/newsController.js`.

- **Action**: User Login
- **Connection**: `auth.js` -> `api.js` (`login`) -> Backend `routes/authRoutes.js` -> `controllers/authController.js`.

## 4. Page Logic Flow
1. **Landing**: `index.html` renders.
2. **Data Load**: `DOMContentloaded` triggers `loadNews`.
3. **Categories**: Clicking a category updates `currentCategory` and re-calls `loadNews`.
4. **Auth**: Login status is checked via `localStorage`.

// turbo
## 5. Quick Status Check
To verify if both parts are ready:
1. Check if `Backend/.env` exists and has `MONGO_URI`.
2. Check if `Frontend/js/api.js` has the correct `API_BASE` URL.
