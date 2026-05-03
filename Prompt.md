-- Below is a **production-grade Jules prompt** tailored for your use case. I’m assuming the role of a **Senior AI Systems Architect + Game DevOps Lead**—so this prompt is structured for execution inside Jules with MCP integrations (Linear, Neon, Supabase, Render, etc.), not just brainstorming.

-- Make a step-by-step plan (plan.md) for updating, developing, and deploying the project. Then execute them along with the plan.md one by one. Also, check output files for errors and fix them. If any API or settings are missing that you can't do it, let me know with instructions to fix it.
---

# 🔧 JULES MASTER PROMPT — Infinite Adventure Engine Upgrade

## 🎯 ROLE

You are an **Autonomous Senior Game Engineer + DevOps Architect** operating in **Production Mode** inside Jules.

You have full access to:

* GitHub repo: [https://github.com/joyiswar/Infinite-Adventure-Engine](https://github.com/joyiswar/Infinite-Adventure-Engine)
* MCP integrations: Linear, Neon, Stitch, Supabase, Context7, Render

Your job is to:

> Audit → Architect → Upgrade → Implement → Deploy → Monitor

---

## 📌 CONTEXT (IMPORTANT)

The project is an **adventure / infinite-style game engine**. These engines typically involve:

* Core gameplay loop (movement, scoring, difficulty scaling)
* Rendering layer (2D/3D, often WebGL or engine-based)
* State management
* Asset pipeline
* Backend (optional: leaderboard, auth, multiplayer)

Modern game engines and frameworks emphasize:

* Modular architecture
* Web deployment compatibility
* Real-time services (WebRTC, multiplayer)
* Scalable backend infra ([Donga IGC][1])

---

# 🧠 PHASE 1 — FULL REPO ANALYSIS

### Step 1: Deep Codebase Audit

* Clone and scan entire repository
* Identify:

  * Language(s), framework(s), engine (Three.js, Unity, Phaser, etc.)
  * Folder structure (client/server/assets)
  * Build system (Vite, Webpack, etc.)
  * Dependencies and outdated packages
  * Dead code, unused files, logs, test artifacts

### Step 2: Architecture Mapping

Generate:

* System architecture diagram
* Game loop breakdown
* Rendering pipeline
* Input handling system
* State management pattern

### Step 3: Technical Debt Report

Classify:

* 🔴 Critical (breaking / insecure)
* 🟠 Medium (performance / scalability)
* 🟡 Low (cleanup / refactor)

Create Linear issues automatically.

---

# 🧱 PHASE 2 — MODERN ARCHITECTURE DESIGN

## Target Architecture (MANDATORY)

Refactor toward:

### Frontend (Game Client)

* Engine: Three.js / WebGL OR current engine (optimize, don’t rewrite blindly)
* Structure:

  ```
  /engine
  /systems
  /entities
  /scenes
  /ui
  /assets
  ```

### Backend (if needed)

* Supabase (Auth + DB + Realtime)
* Neon (Postgres for game data if scaling required)

### API Layer

* Edge functions (Supabase / serverless)
* Game state sync endpoints

### DevOps

* Render → deployment
* CI/CD via GitHub Actions

---

# ⚙️ PHASE 3 — FEATURE UPGRADES

## Core Gameplay Improvements

* Modular game loop
* Difficulty scaling system
* Object pooling (performance)
* Collision optimization

## Advanced Features

* Player profiles (Supabase Auth)
* Leaderboard system
* Save/load progress
* Multiplayer-ready architecture (optional)

## AI Enhancements (IMPORTANT)

* AI NPC or procedural events
* Dynamic difficulty adjustment
* Optional AI storytelling (if narrative engine)

---

# 🧹 PHASE 4 — CLEANUP & REFACTOR

### Remove:

* Unused files (logs, temp, old configs)
* Redundant assets
* Dead components

### Standardize:

* ESLint + Prettier
* Folder naming
* Environment configs

### Optimize:

* Bundle size
* Lazy loading assets
* Texture compression

---

# 🔌 PHASE 5 — MCP INTEGRATION EXECUTION

## Linear

* Create issues for:

  * Bugs
  * Features
  * Refactors
* Group into:

  * Sprint 1: Stabilization
  * Sprint 2: Features
  * Sprint 3: Scaling

## Supabase

* Setup:

  * Auth (email/social)
  * Tables:

    * users
    * scores
    * sessions
* Enable realtime leaderboard

## Neon

* Optional: advanced analytics DB
* Store gameplay metrics

## Stitch / Context7

* Generate:

  * Documentation
  * API references
  * Dev onboarding guide

## Render

* Setup:

  * Auto deploy from GitHub
  * Preview environments
  * Environment variables

---

# 🚀 PHASE 6 — DEPLOYMENT PIPELINE

### CI/CD

* GitHub Actions:

  * Lint
  * Build
  * Test
  * Deploy to Render

### Environments

* dev
* staging
* production

### Monitoring

* Logs
* Error tracking
* Performance metrics

---

# 📊 PHASE 7 — TESTING & QA

* Unit tests (core logic)
* Integration tests (API + DB)
* Gameplay testing
* Performance benchmarking

---

# 📦 PHASE 8 — FINAL OUTPUTS

You MUST produce:

## 1. Updated Codebase

* Clean, modular, production-ready

## 2. Documentation

* README (rewritten)
* Architecture diagram
* Setup guide

## 3. Deployment Links

* Live game URL
* API endpoints

## 4. Linear Board

* Fully structured roadmap

---

# ⚠️ EXECUTION RULES

* DO NOT rewrite entire engine unless necessary
* PRIORITIZE incremental improvements
* KEEP backward compatibility where possible
* AUTOMATE everything possible
* USE MCP tools actively (not just suggest)

---

# 🧩 OPTIONAL (HIGH VALUE)

If feasible:

* Add PWA support
* Mobile optimization
* WebXR compatibility (future-ready direction seen in modern engines ([Donga IGC][1]))

---

# 🟢 FINAL COMMAND

> Start in **Production Mode**
> Execute Phase 1 immediately
> Then proceed sequentially without waiting for confirmation

---

[1]: https://www.dongaigc.com/p/EtherealEngine/etherealengine?utm_source=chatgpt.com "etherealengine - 构建沉浸式社交空间的开源元宇宙引擎 - 懂AI"
