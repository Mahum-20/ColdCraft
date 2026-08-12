# ColdCraft AI — 100% Free CTO Email Discovery & Technical Pitch Engine

**ColdCraft AI** is a zero-cost tool built for developers and technical founders to locate verified corporate CTO email addresses and generate highly targeted outreach pitches tailored to engineering bottlenecks.

---

## Features

1. **Free Email Finder & Verification**:
   - Generates the top 10 corporate email permutations (`first.last`, `first`, `f.last`, `firstlast`, etc.).
   - Resolves DNS **MX records**, **SPF**, and **DMARC** authentication policies.
   - Runs free direct **SMTP handshake verification** (`smtplib`).
   - **Smart Catch-All Shield**: Detects catch-all mail servers using randomized address probing.

2. **AI Pain-Point Extractor**:
   - Parses job descriptions or company snippets to automatically isolate underlying technology stack tags (Python, Celery, PostgreSQL, Django, React, AWS, Docker, Kubernetes) and bottleneck themes.

3. **Multi-Angle Technical Pitch Generator**:
   - Generates 4 distinct outreach variations:
     1. *Technical Bottleneck Fix* (Direct, highly technical)
     2. *Low-Friction Quick Question* (Casual, internal tone)
     3. *Problem-Agitate-Solve (PAS)* (Structured conversion framework)
     4. *Value-First Case Study* (Immediate ROI & proof)
   - Evaluates subject line deliverability scores & checks for spam triggers.
   - Integrates free **Google Gemini API** (`gemini-1.5-flash`) or runs offline via the built-in rules generator.

4. **Interactive Dashboard**:
   - Gmail / Outlook visual client preview modal.
   - One-click `mailto:` launcher pre-filling recipient, subject line, and draft text.
   - Export pitches as Markdown or copy directly to clipboard.

---

## How to Run the Tool

### Option 1: Quick Launch (Windows)
Double click `run.bat` or execute in terminal:
```cmd
.\run.bat
```

---

### Option 2: Manual Terminal Launch

#### 1. Start the Backend API (FastAPI)
```bash
python backend/app.py
```
*Backend API will run at:* `http://127.0.0.1:8000`

#### 2. Start the Frontend Dashboard (React + Vite)
In a separate terminal window:
```bash
npm run dev
# OR
npx vite --host 127.0.0.1 --port 5173
```
*Web UI will run at:* `http://127.0.0.1:5173`

---

## Technical Architecture & Dependencies

- **Backend**: Python 3.12, FastAPI, Uvicorn, `dnspython`, `smtplib`, `httpx`, `google-generativeai`
- **Frontend**: React 18, Vite, Lucide Icons, Tailwind CSS, Modern Dark UI Glassmorphism Design
