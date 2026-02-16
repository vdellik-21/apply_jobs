# JobFill AI - Chrome Extension for Automated Job Applications

An AI-powered Chrome extension that automatically fills job application forms across any website. Built with React, FastAPI, MongoDB, and a Chrome Extension.

![JobFill AI](https://img.shields.io/badge/version-1.1.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Chrome Extension Setup](#chrome-extension-setup)
- [How It Works](#how-it-works)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## Overview

JobFill AI is a comprehensive job application automation tool that consists of three main components:

1. **Chrome Extension** - Injects into any webpage and automatically fills job application forms
2. **Web Dashboard** - Manage your profile, track applications, configure settings
3. **Backend API** - Stores data, provides AI-powered form analysis, serves the extension

The extension uses intelligent pattern matching to detect form fields and fill them with your profile data. It supports:
- Standard HTML forms (inputs, selects, textareas)
- Modern UI components (styled div buttons, ARIA radio groups)
- Segmented Yes/No controls
- Autocomplete dropdowns
- Complex multi-step application flows

---

## Features

### Chrome Extension
- **Universal Compatibility** - Works on ANY website with job applications
- **Smart Form Detection** - Identifies form fields using multiple strategies (name, id, label, placeholder, ARIA attributes)
- **Human-like Typing** - Mimics human behavior with configurable typing speed and random delays to avoid detection
- **Smart Navigation** - Automatically finds and clicks "Apply" buttons to navigate to application forms
- **Custom UI Handling** - Handles non-standard form elements:
  - Segmented Yes/No button pairs
  - ARIA-based radio groups
  - Custom styled dropdowns
  - Toggle switches
- **Stuck State UI** - When confused, displays a help panel with options:
  - Resume filling
  - Skip field
  - Manual guide mode (click to show the extension which element to interact with)
- **Application Logging** - Automatically logs every application you submit

### Web Dashboard
- **Profile Management** - Store and edit your personal information:
  - Contact details (name, email, phone, LinkedIn)
  - Full address (street, city, state, zip, country)
  - Work experience (multiple positions)
  - Education history
  - Skills and certifications
  - Highlight tags for quick reference
- **Application Tracking** - View all submitted applications with:
  - Company, position, platform
  - Application status (Applied, Interview, Rejected, Offer)
  - Date applied
  - Export to Excel
- **Settings** - Configure extension behavior:
  - AI provider selection (Emergent, OpenAI, Claude)
  - Typing speed (instant, fast, human, slow)
  - Platform toggles
  - Auto-submit option
- **Statistics Dashboard** - Track your job search progress:
  - Total applications
  - Weekly/daily counts
  - Success rate
  - Platform breakdown

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                           │
│  ┌─────────────────┐    ┌─────────────────────────────────────┐ │
│  │ Chrome Extension│    │         Web Dashboard               │ │
│  │  - content.js   │    │  - React SPA                        │ │
│  │  - background.js│    │  - Profile, Settings, Applications  │ │
│  │  - popup.html   │    │  - Statistics & Tracking            │ │
│  └────────┬────────┘    └──────────────────┬──────────────────┘ │
│           │                                │                     │
└───────────┼────────────────────────────────┼─────────────────────┘
            │                                │
            │         HTTPS API Calls        │
            │                                │
            ▼                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    FastAPI Application                       │ │
│  │  - /api/profile      - User profile CRUD                    │ │
│  │  - /api/settings     - Extension settings                   │ │
│  │  - /api/applications - Application tracking                 │ │
│  │  - /api/ai/analyze   - AI-powered form analysis             │ │
│  │  - /api/extension    - Extension download                   │ │
│  └─────────────────────────────┬───────────────────────────────┘ │
│                                │                                 │
│                                ▼                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      MongoDB Database                        │ │
│  │  - profiles_collection    (user profile data)               │ │
│  │  - applications_collection (tracked applications)           │ │
│  │  - settings_collection    (extension configuration)         │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
            │
            │ (Optional) AI Provider API
            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Emergent LLM / OpenAI / Anthropic Claude                       │
│  - Form field analysis                                          │
│  - Intelligent matching                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 18, Tailwind CSS, Shadcn UI, Framer Motion |
| **Backend** | Python 3.9+, FastAPI, Pydantic |
| **Database** | MongoDB |
| **Extension** | Chrome Manifest V3, JavaScript |
| **AI (Optional)** | OpenAI GPT-4o-mini, Claude Haiku, Emergent LLM |

---

## Project Structure

```
/app
├── backend/
│   ├── server.py           # FastAPI application with all endpoints
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables (MONGO_URL, API keys)
│
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React app with routing
│   │   ├── index.css      # Global styles
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # Statistics overview
│   │   │   ├── Profile.jsx        # Profile management
│   │   │   ├── Applications.jsx   # Application tracking
│   │   │   ├── Settings.jsx       # Extension configuration
│   │   │   └── Extension.jsx      # Download & install guide
│   │   └── components/
│   │       └── ui/        # Shadcn UI components
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env              # REACT_APP_BACKEND_URL
│
├── chrome-extension/
│   ├── manifest.json      # Extension manifest (V3)
│   ├── content.js         # Injected script - form filling logic
│   ├── content.css        # Styles for indicator & stuck panel
│   ├── background.js      # Service worker - API communication
│   ├── popup.html         # Extension popup UI
│   ├── popup.js           # Popup logic
│   └── icons/             # Extension icons (16, 48, 128px)
│
├── chrome-extension.zip   # Packaged extension for distribution
└── README.md              # This file
```

---

## Setup Instructions

### Prerequisites

- **Node.js** 18+ and **Yarn**
- **Python** 3.9+
- **MongoDB** (local or Atlas)
- **Chrome Browser**

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   Create a `.env` file:
   ```env
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=jobfill_db
   EMERGENT_LLM_KEY=your_emergent_key_here  # Optional, for AI features
   ```

5. **Run the server:**
   ```bash
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

   The API will be available at `http://localhost:8001`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Configure environment variables:**
   Create/edit `.env` file:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8001
   ```

4. **Run the development server:**
   ```bash
   yarn start
   ```

   The dashboard will be available at `http://localhost:3000`

### Chrome Extension Setup

1. **Update API URL in extension:**
   Edit `chrome-extension/background.js` line 2:
   ```javascript
   const API_BASE = 'http://localhost:8001';  // Or your deployed URL
   ```

2. **Load the extension in Chrome:**
   - Open Chrome and navigate to `chrome://extensions`
   - Enable **Developer mode** (toggle in top right)
   - Click **Load unpacked**
   - Select the `chrome-extension` folder

3. **Verify installation:**
   - You should see the JobFill AI icon in your toolbar
   - Visit any job application page
   - A teal "⚡ JobFill Ready" indicator should appear in the bottom right

---

## How It Works

### Form Filling Process

1. **Page Detection**
   - Extension checks if the page has form elements (`input`, `select`, `textarea`)
   - Displays the "JobFill Ready" indicator

2. **Profile Loading**
   - Background script fetches user profile from backend API
   - Profile data is cached in the content script

3. **Field Detection**
   When user clicks the indicator:
   ```
   findAllFields() → Scans DOM for:
   ├── Text inputs (name, email, phone, etc.)
   ├── Select dropdowns
   ├── Radio button groups
   ├── Checkboxes
   ├── ARIA-based custom controls
   └── Segmented Yes/No buttons
   ```

4. **Field Matching**
   For each field, the extension:
   ```
   getFieldValue(field) → Analyzes:
   ├── field.name
   ├── field.id
   ├── field.placeholder
   ├── Associated <label> text
   ├── aria-label attribute
   └── autocomplete attribute
   
   Then matches against patterns:
   ├── fieldPatterns.firstName → /first[_\-\s]?name|fname|.../
   ├── fieldPatterns.email → /e[\-_]?mail|email[_\-\s]?address|.../
   └── ... (50+ patterns)
   ```

5. **Value Filling**
   - Text fields: Uses human-like typing with configurable delays
   - Dropdowns: Matches option text/value against desired value
   - Radio buttons: Clicks appropriate option based on context
   - Yes/No buttons: Determines correct answer from question context

6. **Stuck Handling**
   If the extension can't determine how to fill a field:
   - Shows a "Stuck" panel with the problematic field highlighted
   - User can: Resume, Skip, or manually Guide the extension

### Pattern Matching Examples

| Field Pattern | Matches |
|--------------|---------|
| `firstName` | first_name, fname, given_name, first |
| `email` | email, e-mail, email_address, correo |
| `phone` | phone, tel, mobile, cell, telephone |
| `workAuth` | authorized, legally, eligible, right to work |
| `visaSponsorship` | visa, sponsorship, sponsor, immigration |
| `gender` | gender, sex, male, female, identify |

### Yes/No Question Logic

The extension determines Yes/No answers based on question context:

| Question Contains | Answer |
|------------------|--------|
| "legally authorized to work" | Yes |
| "require visa sponsorship" | No |
| "willing to relocate" | Yes |
| "background check consent" | Yes |
| "18 years or older" | Yes |
| "non-compete agreement" | No |
| "marketing emails" | No |

---

## API Documentation

### Profile Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update profile |
| POST | `/api/profile/reset` | Reset to default profile |

### Application Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/applications` | List all applications |
| POST | `/api/applications` | Log new application |
| PUT | `/api/applications/{id}` | Update application |
| DELETE | `/api/applications/{id}` | Delete application |
| GET | `/api/applications/stats` | Get statistics |
| GET | `/api/applications/export` | Export for Excel |

### Settings Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get extension settings |
| PUT | `/api/settings` | Update settings |

### AI Endpoint (Optional)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/analyze-form` | AI-powered form field analysis |

### Extension Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/extension/download` | Download extension zip |

---

## Configuration

### Extension Settings

| Setting | Options | Description |
|---------|---------|-------------|
| `typing_speed` | instant, fast, human, slow | How fast to type in fields |
| `random_delays` | true/false | Add random pauses for stealth |
| `auto_submit` | true/false | Automatically submit forms |
| `save_applications` | true/false | Log applications to database |
| `ai_provider` | emergent, openai, claude | AI provider for form analysis |

### Typing Speed Delays

| Speed | Min Delay | Max Delay |
|-------|-----------|-----------|
| instant | 0ms | 0ms |
| fast | 30ms | 80ms |
| human | 50ms | 150ms |
| slow | 100ms | 300ms |

---

## Troubleshooting

### Extension not showing indicator
- Make sure the page has form elements
- Check if the extension is enabled in `chrome://extensions`
- Look for errors in DevTools Console (F12)

### Fields not being filled
- Open DevTools Console (F12) to see debug logs
- Check if field patterns match your form's field names
- Try the "Click to Guide" feature to manually show the extension

### "Stuck" panel not appearing
- Ensure you're using the latest version of the extension
- Check Console for JavaScript errors

### API connection errors
- Verify `API_BASE` in `background.js` matches your backend URL
- Check if backend is running
- Look for CORS errors in Console

### Profile not loading
- Call `GET /api/profile` directly to verify backend is working
- Check MongoDB connection in backend logs

---

## License

MIT License - see LICENSE file for details.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
