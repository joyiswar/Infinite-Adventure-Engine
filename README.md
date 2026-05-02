# Infinite Adventure Engine

Welcome to the Infinite Adventure Engine, a cutting-edge web application that redefines the choose-your-own-adventure genre. Powered by Google Gemini API and modern cloud infrastructure, this application offers a truly dynamic, secure, and endless storytelling experience.

## Features

- **Infinite Storylines**: Generative AI creates unique stories that adapt dynamically to your decisions.
- **AI-Generated Imagery**: Visual consistency is maintained through carefully crafted art style prompts for characters and environments.
- **Persistent Cloud Saves**: Your progress is now securely stored in the cloud using Supabase, allowing you to resume your adventure from any device.
- **Secure Architecture**: AI operations are proxied through server-side Edge Functions, ensuring API keys remain protected and never exposed to the client.
- **Dynamic State Tracking**: A smart sidebar tracks your `Inventory`, `Quest`, and `Lore Codex` in real-time.
- **Zoneless Performance**: Built with Angular 21's zoneless change detection for maximum efficiency and speed.

## How It Works

The application leverages a hybrid architecture:
1.  **Frontend**: A modern Angular application (v21) built with Vite (v8), providing a responsive and fluid UI.
2.  **Backend (Edge Functions)**: Supabase Edge Functions act as a secure bridge between the player and Google Gemini API (`gemini-1.5-flash`).
3.  **Data Persistence**: Supabase Database manages user save slots and achievements with Row Level Security (RLS).
4.  **Deployment**: Automated CI/CD pipelines host the frontend on Render, with edge logic running globally on Supabase.

## Tech Stack

- **Framework**: Angular 21 (Zoneless)
- **Build Tool**: Vite 8 / Analogjs
- **Backend/Auth**: Supabase (Database, Auth, Edge Functions)
- **AI**: Google Gemini API
- **Deployment**: Render / Supabase
- **Language**: TypeScript 5.9

## Setup and Installation

### Prerequisites
- **Node.js**: Version 24 or higher is required.
- **Supabase Account**: A Supabase project is needed for authentication and data persistence.
- **Google Gemini API Key**: An API key from Google AI Studio is required for story generation.

### Local Setup
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/joyiswar/Infinite-Adventure-Engine.git
    cd Infinite-Adventure-Engine
    ```

2.  **Install Dependencies**:
    Due to specific peer dependency requirements in the modern Angular/Vite ecosystem, use the following command:
    ```bash
    npm install --legacy-peer-deps
    ```

3.  **Configure Environment**:
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

## Running the Application

### Development Mode
To start the local development server with live reloading:
`npm run dev`

### Production Build
To compile the application for production:
`npm run build`

### Run Production Preview
To preview the production build locally:
`npm run serve`

## Production Deployment Guide

### Frontend Deployment (Render)
1.  Sign up for a [Render](https://render.com) account.
2.  Create a new **Web Service** and connect this GitHub repository.
3.  Set the following build and start commands:
    - **Build Command**: `npm install --legacy-peer-deps && npm run build`
    - **Start Command**: `npm run serve`
4.  Add the environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Render dashboard.

### Backend Deployment (Supabase)
1.  Deploy the edge function provided in `supabase/functions/adventure-engine`.
2.  Store your `GEMINI_API_KEY` in Supabase Secrets.
3.  Run the provided SQL migrations to set up the `save_slots` and `achievements` tables.

## About the Developer

**Mamun Chowdhury**
Senior IT Project Manager & Software Architect

Mamun is a technical leader dedicated to building high-performance, AI-integrated web applications and scalable backend infrastructures. With expertise in modular architecture and real-time services, he provides strategic leadership and mentorship to global teams of developers and designers.

- **Portfolio & Contact**: [https://mamun.pt](https://mamun.pt/)
- **LinkedIn**: [Mamun Chowdhury](https://www.linkedin.com/in/mamun-pt/)
- **Company**: Vertigo Sourcing
