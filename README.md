# Infinite Adventure Engine

Welcome to the Infinite Adventure Engine, a cutting-edge web application that redefines the choose-your-own-adventure genre. Powered by Google's Gemini API and modern cloud infrastructure, this application offers a truly dynamic, secure, and endless storytelling experience.

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
2.  **Backend (Edge Functions)**: Supabase Edge Functions act as a secure bridge between the player and Google's Gemini API (`gemini-1.5-flash`).
3.  **Data Persistence**: Supabase Database manages user save slots and achievements with Row Level Security (RLS).
4.  **Deployment**: Automated CI/CD pipelines host the frontend on Render, with edge logic running globally on Supabase.

## Tech Stack

- **Framework**: Angular 21 (Zoneless)
- **Build Tool**: Vite 8 / Analogjs
- **Backend/Auth**: Supabase (Database, Auth, Edge Functions)
- **AI**: Google Gemini API
- **Deployment**: Render / Supabase
- **Language**: TypeScript 5.9

## Getting Started

### Development
To run the project locally, ensure you have Node.js 24+ installed.

```bash
# Install dependencies (requires legacy-peer-deps for Angular/Vite compatibility)
npm install --legacy-peer-deps

# Build the project
npm run build
```

## About the Developer

Mamun Chowdhury has extensive experience in IT and customer support. He currently works as an IT project manager at Vertigo Sourcing, where he provides strategic leadership and mentorship to a team of web developers, designers, and other IT professionals.
