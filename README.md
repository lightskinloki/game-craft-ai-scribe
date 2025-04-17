# GameCraft AI Scribe

## Overview

GameCraft AI Scribe is an interactive web application designed to assist game developers by leveraging the power of Google's Gemini AI. It provides a coding environment where you can:

*   Get AI-powered explanations for game development concepts and code.
*   Receive suggestions for implementing features or fixing bugs based on your prompts and existing code.
*   Utilize a code editor with syntax highlighting and line numbers.
*   Switch between a general JavaScript mode and a dedicated **Phaser 3 mode**.
*   In Phaser 3 mode:
    *   See a **live preview** of your running Phaser game code.
    *   Manage game assets (images, audio) via an integrated **Asset Manager**.
    *   Automatically apply AI-suggested code changes (when feasible) with an "Apply Changes" button.
    *   Get AI assistance for fixing runtime errors detected in the live preview.

This tool aims to accelerate learning and development by bridging the gap between ideas and implementation with AI guidance.

## Features

*   **AI Code Explanation & Generation:** Submit prompts and existing code to get explanations and suggested code snippets/modifications from Google Gemini.
*   **Dual Mode Operation:**
    *   **General JavaScript:** Standard code editing and AI explanations.
    *   **Phaser 3 Mode:** Enhanced features specifically for Phaser development.
*   **Live Game Preview (Phaser Mode):** Instantly run and visualize your Phaser code in an isolated iframe.
*   **Asset Management (Phaser Mode):** Upload, view, delete, and copy URLs for game assets served locally. Assets are automatically injected into the `preload` function for the preview.
*   **Code Editor:** Integrated CodeMirror editor with JavaScript syntax highlighting, line numbers, and basic editing features.
*   **Apply AI Suggestions (Hybrid Approach):** Button appears when the AI provides applicable full code modifications (typically for smaller changes), allowing one-click application to the editor. Handles large files gracefully by relying on explanation/snippets.
*   **AI Error Fixing Assist (Phaser Mode):** Detects runtime errors in the game preview and offers a button to prompt the AI for a fix based on the error message and current code.

## Tech Stack

**Frontend:**

*   React (with TypeScript)
*   Vite (Build tool & Dev Server)
*   Tailwind CSS (Styling)
*   shadcn/ui (UI Components)
*   CodeMirror (`@uiw/react-codemirror`) (Code Editor)
*   Phaser 3 (Loaded via CDN in preview)

**Backend:**

*   Python 3
*   Flask (Web Framework)
*   Google Generative AI SDK (`google-generativeai`)
*   Flask-CORS
*   python-dotenv (Environment variables)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

1.  **Git:** For cloning the repository.
2.  **Python:** Version 3.8 or higher recommended. Make sure `python` and `pip` are added to your system's PATH.
3.  **Node.js:** LTS version (18.x or 20.x recommended) or higher. This includes `npm`. Make sure `node` and `npm` are added to your system's PATH.
4.  **Google Gemini API Key:** You need an API key from [Google AI Studio](https://aistudio.google.com/app/apikey) to use the AI features.

## Installation and Setup

Follow these steps carefully to set up the project locally:

1.  **Clone the Repository:**
    Open your terminal or command prompt and run:
    ```bash
    git clone https://github.com/lightskinloki/game-craft-ai-scribe.git
    cd game-craft-ai-scribe
    ```

2.  **Backend Setup:**
    *   Navigate to the backend directory:
        ```bash
        cd backend
        ```
    *   **Create a Python Virtual Environment:** (Recommended)
        ```bash
        python -m venv venv
        ```
    *   **Activate the Virtual Environment:**
        *   Windows (PowerShell): `.\venv\Scripts\Activate.ps1`
        *   Windows (CMD): `.\venv\Scripts\activate.bat`
        *   macOS / Linux: `source venv/bin/activate`
        *(You should see `(venv)` appear at the beginning of your terminal prompt)*
    *   **Install Backend Dependencies:**
        ```bash
        # If requirements.txt exists:
        # pip install -r requirements.txt

        # If not, install manually:
        pip install Flask Flask-Cors google-generativeai python-dotenv Werkzeug
        ```
    *   **Create Environment File:** Create a file named `.env` inside the `backend` directory.
    *   **Add API Key:** Open the `.env` file and add your Gemini API key:
        ```
        GEMINI_API_KEY=YOUR_ACTUAL_API_KEY_HERE
        ```
        *(Replace `YOUR_ACTUAL_API_KEY_HERE` with your key)*

3.  **Frontend Setup:**
    *   Navigate back to the **root project directory** from the `backend` directory:
        ```bash
        cd ..
        ```
    *   **Install Frontend Dependencies:**
        ```bash
        npm install
        ```

Setup is now complete!

## Running the Application Locally (Manual Method)

You need to run the backend and frontend servers simultaneously in separate terminals.

1.  **Terminal 1: Start Backend Server**
    *   Navigate to the `backend` directory: `cd backend`
    *   **Activate the virtual environment** (if not already active):
        *   Windows (PowerShell): `.\venv\Scripts\Activate.ps1`
        *   Windows (CMD): `.\venv\Scripts\activate.bat`
        *   macOS / Linux: `source venv/bin/activate`
    *   Run the Flask app:
        ```bash
        python app.py
        ```
    *   Leave this terminal running. You should see output indicating the server is running on port 5000.

2.  **Terminal 2: Start Frontend Server**
    *   Navigate to the **root project directory**: `cd path/to/game-craft-ai-scribe`
    *   Run the Vite development server:
        ```bash
        npm run dev
        ```
    *   Leave this terminal running. It will compile the frontend and provide a `Local:` URL (e.g., `http://localhost:5173/`).

3.  **Access the App:**
    *   Open your web browser and go to the `Local:` URL provided by the frontend server (e.g., `http://localhost:5173/`).

## Running the Application (Optional Windows Shortcut)

**Note:** This method is **only for Windows users** and serves as a convenience **after** you have successfully completed all the steps in the [Installation and Setup](#installation-and-setup) section above. Users on macOS or Linux should use the manual method described above.

---

Once the initial setup is complete, Windows users can use the provided `start_app.bat` script to launch both the backend (Flask) and frontend (Vite) development servers simultaneously:

1.  **Navigate to the root project directory** (`game-craft-ai-scribe`) in Windows File Explorer.
2.  **Double-click** the `start_app.bat` file.

**What to Expect:**

*   A command prompt window will open briefly and perform some basic checks.
*   A **new command prompt window** titled "Backend Server (Flask)" will open and start the Flask server.
*   A **second new command prompt window** titled "Frontend Server (Vite)" will open and start the Vite development server.
*   The initial command prompt window will remain open with final instructions.

**Accessing the App:**

*   Open your web browser and navigate to the `Local:` URL provided by the "Frontend Server (Vite)" window (e.g., `http://localhost:5173/`).

**Stopping the Servers:**

*   To stop the application, go to each of the two server windows ("Backend Server (Flask)" and "Frontend Server (Vite)") and press `Ctrl + C`. You may need to confirm termination.

Frank Brown made this.
