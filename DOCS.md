# Infinite Adventure Engine - Developer Documentation

Welcome to the Infinite Adventure Engine (IAE) developer guide. This document provides an in-depth look at the engine architecture, systems, and onboarding procedures.

## 🏛 Architecture Overview

IAE follows a modular, system-based architecture designed for scalability and security in an AI-driven environment.

### 📁 Directory Structure
-   **/src/engine**: Contains the core orchestration logic. The `ai-engine.service.ts` manages the communication with AI proxies.
-   **/src/systems**: Autonomous services that manage specific game domains:
    -   `persistence-system`: Handles cloud and local state synchronization.
    -   `achievement-system`: Tracks and unlocks player accolades.
    -   `difficulty-scaling`: Dynamically adjusts AI hostility based on performance.
    -   `leaderboard-system`: Interfaces with Supabase Realtime for global rankings.
    -   `audio-system`: Manages procedural and static sound effects.
-   **/src/entities**: Shared TypeScript models and interfaces representing game data.
-   **/src/scenes**: High-level components managing game states (e.g., `AdventureScene`).
-   **/src/ui**: Reusable, presentation-focused UI components and widgets.
-   **/supabase/functions**: Secure server-side logic, including the Gemini AI proxy.

---

## 🛠 Technical Onboarding

### Development Environment
-   **Node.js**: v24.14.1 (recommended)
-   **Framework**: Angular 21 (Zoneless)
-   **Build Tool**: Vite 8 / Analogjs
-   **Testing**: Vitest with JSDOM

### Local Setup
1.  **Clone**: `git clone https://github.com/joyiswar/Infinite-Adventure-Engine.git`
2.  **Install**: `npm install --legacy-peer-deps`
3.  **Environment**: Create a `.env` file:
    ```env
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-key
    ```
4.  **Run**: `npm run dev`

---

## ☁️ Cloud Infrastructure

### Supabase Integration
IAE utilizes Supabase for:
-   **Authentication**: Google OAuth and Email/Password.
-   **Database**: PostgreSQL for `save_slots`, `achievements`, and `leaderboard`.
-   **Realtime**: Live updates for the global leaderboard.
-   **Edge Functions**: Secure proxy for Google Gemini API to prevent key exposure.

### Neon Analytics
Used for high-volume gameplay metrics and long-term storage of session events via the `gameplay_metrics` table.

---

## 🧪 Testing & Quality
-   **Unit Tests**: Run `npx vitest run` to execute the suite.
-   **Linting**: Run `npx eslint src` to verify code quality.
-   **Formatting**: Managed via Prettier.

---

## 🚀 Release Pipeline
-   **CI**: GitHub Actions validates builds and linting on every PR.
-   **CD**: Render automatically deploys successful builds from the `main` branch.

For further inquiries, visit [mamun.pt](https://mamun.pt).
