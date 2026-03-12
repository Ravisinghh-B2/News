---
description: Project Overview and Development Workflow
---

# NewsHub: Project Architecture & Development Workflow

This workflow document provides a visual design of the NewsHub architecture, detailing the flow of data between the frontend and backend, along with the step-by-step development setup.

## 1. Architecture Workflow Design

```mermaid
flowchart TD
    %% Frontend Structure
    subgraph Frontend [Frontend Sandbox (Vanilla JS, HTML, CSS)]
        UI[User Interface]
        AuthUI[Auth Pages - Login/Signup]
        NewsUI[News & Category Pages]
        ProfileUI[User Profile & Saved News]
        
        UI --> AuthUI
        UI --> NewsUI
        UI --> ProfileUI
    end

    %% Backend Server
    subgraph Backend [Backend Server (Node.js, Express)]
        API[Express API Router /api/v1]
        AuthController[Auth Controller]
        NewsController[News Controller]
        UserController[User Controller]
        CronJob[Node-Cron Scheduler]
        
        API -->|/auth| AuthController
        API -->|/news| NewsController
        API -->|/users| UserController
        CronJob -.->|Fires every 10 mins| NewsController
    end

    %% External Services & Database
    subgraph DatabaseLayer [Data Persistence]
        MongoDB[(MongoDB)]
    end
    
    subgraph ExternalAPIs [Third-party Services]
        GlobalNews[Global News APIs]
    end

    %% Application Flow Connections
    AuthUI <-->|REST / POST| API
    NewsUI <-->|REST / GET| API
    ProfileUI <-->|REST / GET & POST| API
    
    AuthController <-->|Read/Write Users| MongoDB
    UserController <-->|Manage Saved News| MongoDB
    NewsController <-->|Cache/Read Articles| MongoDB
    
    NewsController <-->|Fetch Live Data| GlobalNews
```

## 2. Tech Stack Summary
- **Frontend Environment:** Vanilla JavaScript (ES6+), HTML5, custom CSS3 (Grid + Flexbox + Theme Variables). No frameworks.
- **Backend Environment:** Node.js, Express.js API.
- **Database Components:** MongoDB, Mongoose schemas.
- **Security & Utilities:** `bcryptjs` (hashing), `jsonwebtoken` (auth tokens), `helmet` & `cors` (security headers), `node-cron` (background caching).

## 3. Local Development Steps

Follow these steps to build and run the application concurrently:

1. **Install Root level packages**
   Installs `concurrently` for running dual servers.
   ```bash
   npm install
   ```

2. **Install Backend level packages**
   Installs Express, Mongoose, and required packages for the server.
   ```bash
   cd Backend && npm install
   ```

3. **Check Environment Variables**
   Ensure an `.env` configuration file exists in the Backend folder.
   ```bash
   # Check the backend configuration keys
   cat Backend/.env
   ```
   *(Required keys: `PORT`, `MONGO_URI`, `JWT_SECRET`)*

4. **Start the Application**
   This script triggers `backend` (Express) and `frontend` (live-server) commands at the same time.
   // turbo
   ```bash
   npm run dev
   ```

## 4. Background Services
The project includes a server-side **cron job** configured to refresh all cached news articles automatically every 10 minutes (`*/10 * * * *`), eliminating the need for manual cache-busting and maintaining blazing-fast load times for front-end users.
