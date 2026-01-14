# Codebase Summary

## Overview
**Project Name**: zettaionkan (Absolute Pitch)
**Purpose**: A music ear training application designed to help users practice identifying chords and single notes. It includes gamification elements and subscription features.

## Tech Stack
- **Frontend Framework**: Vue 3 (Composition API, `<script setup>`)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend/Auth**: Supabase
- **Audio Engine**: Tone.js
- **Music Notation**: abcjs
- **Payments**: Stripe
- **PWA**: Supported via `vite-plugin-pwa`

## Directory Structure

### `src/`
The core frontend application.
- **`views/`**: Contains page components. Key views include:
  - `Home.vue`: Landing page.
  - `ChordQuizz.vue` / `SingleNoteQuizz.vue`: Training interfaces.
  - `AutoPlay.vue`: Auto-play feature.
  - `Subscription.vue`: Subscription management.
  - `Auth.vue`: User authentication.
- **`components/`**: Reusable UI and game logic components.
  - Game Modes: `CatGameMode.vue`, `IceCreamGameMode.vue`, `TrainGameMode.vue`.
  - Music Tools: `ChordSelectionButton.vue`, `ScoreDisplay.vue`.
- **`lib/`**: Library code, including `supabase.js` for client initialization.
- **`router/`**: Vue Router configuration.

### `scripts/`
A collection of Python and Node.js scripts, likely for content creation and automation outside the web app.
- **Content Generation**: Scripts to generate video/audio (e.g., `generate_5h_video.cjs`, `convert_piano.py`).
- **YouTube Automation**: Scripts to upload videos (`upload_to_youtube.py`, `delete_youtube_videos.py`).
- **Asset Processing**: Thumbnail generation, audio processing.
- **APIs Used**: Google Cloud Text-to-Speech (implied by `generate_new_narration.cjs` and dependencies).

## Key Features
- **Ear Training**: Interactive quizzes for chords and notes.
- **Gamification**: Various game modes to engage users.
- **Subscription Model**: Premium features via Stripe.
- **Automation**: Extensive scripting for generating training content (videos/audio), possibly for a companion YouTube channel.
