
# Infinite Adventure Engine

Welcome to the Infinite Adventure Engine, a cutting-edge web application that redefines the choose-your-own-adventure genre. Powered by Google's Gemini API, this application offers a truly dynamic and endless storytelling experience.

## Features

- **Infinite Storylines**: Unlike traditional games with pre-written paths, our engine uses generative AI to create a unique story that adapts and evolves based on your decisions. No two playthroughs are the same.
- **AI-Generated Imagery**: Each step of your journey is visualized with a unique, AI-generated image. A carefully crafted art style prompt ensures visual consistency for characters and environments throughout your adventure.
- **Dynamic State Tracking**: A smart sidebar keeps track of your `Inventory` and current `Quest`. The AI automatically updates these elements as the narrative progresses, immersing you deeper into the world.
- **Seamless UX**: Built with Angular and styled with Tailwind CSS, the interface is clean, responsive, and intuitive, focusing your attention on the story.
- **Zoneless Performance**: Leveraging Angular's modern zoneless change detection for a fast and efficient user experience.

## How It Works

The application uses `gemini-2.5-flash` to generate the story, choices, inventory, and quest updates in a structured JSON format. This text is then used to prompt `imagen-4.0-generate-001` for a visually consistent image, bringing the scene to life.

The entire frontend is a standalone Angular application, architected for performance and maintainability.

## Tech Stack

- **Framework**: Angular (Zoneless)
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API (`gemini-2.5-flash`, `imagen-4.0-generate-001`)
- **Language**: TypeScript

## About the Developer

Mamun Chowdhury has extensive experience in IT and customer support. He currently works as an IT project manager at Vertigo Sourcing, where he provides strategic leadership and mentorship to a team of web developers, designers, and other IT professionals. Mamun possesses a range of technical skills, including proficiency in front-end and back-end technologies, cloud computing platforms, and networking concepts. He has a strong work ethic, excellent communication skills, and a proven track record of success, making him a valuable asset to any organization he works with.
