# Infinite Adventure Engine

Welcome to the Infinite Adventure Engine, a cutting-edge web application that redefines the choose-your-own-adventure genre. Powered by Google Gemini API and modern cloud infrastructure, this application offers a truly dynamic, secure, and endless storytelling experience.

**Live Production Demo**: [https://infinite-adventure-engine.onrender.com/](https://infinite-adventure-engine.onrender.com/)

## Engine Architecture

The Infinite Adventure Engine is designed as a modern, modular game engine tailored for the web. It implements the core pillars of interactive storytelling:

-   **Core Gameplay Loop**: Manages turn-based decisions, narrative progression, and adaptive difficulty scaling based on player performance.
-   **Rendering Layer**: A responsive frontend layer built with Angular and CSS, visualizing the journey with real-time AI-generated imagery.
-   **State Management**: Leverages Angular Signals for efficient, zoneless state tracking of inventory, quests, and lore.
-   **Asset Pipeline**: A dynamic pipeline that fetches and processes AI-generated text and images on-the-fly.
-   **Backend Integration**: Includes persistent cloud saves, secure AI proxying, and authentication via Supabase.

### Modern Design Principles
Emphasizing modularity and scalability, the engine follows modern standards for web-based interactive media:
-   **Modular Architecture**: Decoupled services for AI, persistence, and UI.
-   **Web Deployment Compatibility**: Optimized for global delivery via Render.
-   **Scalable Backend Infrastructure**: Utilizes Supabase Edge Functions and PostgreSQL for robust, distributed logic and storage, inspired by high-performance engines like [IR Engine](https://github.com/ir-engine/ir-engine).

## Features

-   **Infinite Storylines**: Generative AI creates unique stories that adapt dynamically to your decisions.
-   **AI-Generated Imagery**: Visual consistency is maintained through carefully crafted art style prompts.
-   **Persistent Cloud Saves**: Your progress is securely stored in the cloud using Supabase.
-   **Secure Architecture**: AI operations are proxied through server-side Edge Functions to protect API keys.
-   **Zoneless Performance**: Built with Angular 21 for maximum efficiency.

## Tech Stack

-   **Framework**: Angular 21 (Zoneless)
-   **Build Tool**: Vite 8 / Analogjs
-   **Backend/Auth**: Supabase (Database, Auth, Edge Functions)
-   **AI**: Google Gemini API
-   **Deployment**: Render / Supabase
-   **Language**: TypeScript 5.9

## Setup and Installation

### Local Setup
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/joyiswar/Infinite-Adventure-Engine.git
    cd Infinite-Adventure-Engine
    ```

2.  **Install Dependencies**:
    ```bash
    npm install --legacy-peer-deps
    ```

3.  **Configure Environment**:
    Add your credentials to a `.env` file:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_key
    ```

## Running the Application
-   **Development**: `npm run dev`
-   **Production Build**: `npm run build`
-   **Preview**: `npm run serve`

## About the Developer

**Mamun Chowdhury**
Senior IT Project Manager & Software Architect

Mamun is a technical leader dedicated to building high-performance, AI-integrated web applications and scalable backend infrastructures. With expertise in modular architecture and real-time services, he provides strategic leadership and mentorship to global teams of developers and designers.

-   **Portfolio & Contact**: [https://mamun.pt](https://mamun.pt/)
-   **LinkedIn**: [Mamun Chowdhury](https://www.linkedin.com/in/mamun-pt/)
-   **Company**: Vertigo Sourcing
