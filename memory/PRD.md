# JobFill AI - Chrome Extension for Job Application Auto-Fill

## Original Problem Statement
Create a headless browser AI software extension for Chrome that automates filling out job applications. The extension should launch with the browser and use the user's information (provided via a resume) to pre-fill forms on any job board, including LinkedIn.

## User Personas
- **Job Seekers**: Professionals applying to multiple jobs who want to save time on repetitive form filling
- **Career Changers**: People applying to many positions across different platforms

## Core Requirements
1. **Chrome Extension**: AI-powered form auto-fill that works on any website
2. **Stealth Mode**: Human-like typing behavior to avoid detection
3. **Web Dashboard**: Profile management, application tracking, settings
4. **Smart Navigation**: Detect and click "Apply" buttons to navigate to forms
5. **Custom UI Handling**: Handle modern non-standard form elements (styled divs, ARIA roles)
6. **Stuck State UI**: Display help panel when extension is confused

## Architecture
```
/app
├── backend/          # FastAPI server
│   └── server.py     # API endpoints, LLM integration, MongoDB
├── chrome-extension/ # Chrome extension files
│   ├── content.js    # Form-filling logic with smart navigation
│   ├── content.css   # Styles including stuck panel
│   ├── manifest.json # Extension manifest (v3)
│   ├── background.js # Service worker
│   └── popup.html/js # Extension popup
├── frontend/         # React dashboard
│   └── src/pages/    # Dashboard, Profile, Settings, Applications, Extension
└── chrome-extension.zip # Downloadable artifact
```

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: Python, FastAPI
- **Database**: MongoDB
- **AI**: Emergent LLM Key (OpenAI compatible)

## What's Been Implemented

### Session 1 (Initial Build)
- Full-stack scaffolding (React + FastAPI + MongoDB)
- Web dashboard with dark mode UI
- Profile management (9 work experiences, skills, highlight tags)
- Extension configuration (AI provider switching)
- Chrome extension core build
- Application tracking with export to Excel

### Session 2 (Smart Extension Enhancement) - Feb 15, 2026
- **Smart Navigation**: Auto-detect and click "Apply", "Apply Now" buttons
- **Enhanced Element Detection**: 
  - ARIA role-based radio groups
  - Custom Yes/No button divs
  - Styled toggle components
- **Stuck State UI Panel**:
  - Floating panel appears when confused
  - Shows status message with problem description
  - Action buttons: Resume, Skip Field, Click to Guide
  - User guide mode for manual element selection
- **State Machine**: Tracks extension state (IDLE, SEARCHING_APPLY, FILLING_FORM, STUCK, AWAITING_USER, COMPLETE)

## API Endpoints
- `GET /api/health` - Health check
- `GET/PUT /api/profile` - Profile management
- `POST /api/profile/reset` - Reset to default
- `GET/PUT /api/settings` - Extension settings
- `GET/POST/PUT/DELETE /api/applications` - Application CRUD
- `GET /api/applications/stats` - Statistics
- `GET /api/applications/export` - Excel export
- `POST /api/ai/analyze-form` - AI form analysis
- `GET /api/extension/download` - Download extension zip

## Database Schema
- **profiles_collection**: User profile with personal_info, work_experience, education, skills
- **applications_collection**: Job applications with company, position, status, platform
- **settings_collection**: Extension configuration

## Prioritized Backlog

### P1 - Next Priority
- Wire up manual application status updates on Applications page
- Implement secure API key storage for OpenAI/Claude providers

### P2 - Future
- Email parsing for auto-updating application status
- Refactor content.js into smaller modules
- Add global state manager (Zustand) to frontend

## Testing Status
- Backend API: 25/25 tests passing
- Frontend UI: All pages functional
- Chrome extension: Code complete (requires manual browser testing)

## Notes
- Extension download available at `/api/extension/download`
- To reset profile: `POST /api/profile/reset`
- AI integration uses Emergent LLM Key by default
