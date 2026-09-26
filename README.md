# EchoStock — Smart Health & Supply Chain Resilience
**Team Kryxen | Build With AI: Code for Communities 2nd Edition**

---

## 🚀 Pitch Overview

EchoStock transforms health supply chain management into a proactive, resilient network through two core mechanisms:

1. **Photo-to-Stock Intake**: Frontline health workers photograph medicine shelves; Gemini 1.5/2.0 AI Vision extracts stock counts into JSON with zero manual typing required.
2. **Digital Twin Outbreak Simulator**: District coordinators run epidemic surge scenarios (*Dengue*, *Flu*, *Floods*) to get pre-positioning plans and Haversine distance-weighted redistribution orders before shortages occur.

---

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Visual Charts**: Recharts 2.x
- **Multimodal AI**: Google AI Studio Gemini API (`gemini-1.5-flash`)
- **Database & Realtime Sync**: Firebase Firestore (Spark Free Plan)
- **Deployment**: Firebase Hosting (Single-Page Application SPA rules)

---

## ⚡ Quick Start & Local Setup

1. **Clone repository & install dependencies**:
   ```bash
   git clone https://github.com/YOUR_GITHUB_USERNAME/EchoStock.git
   cd EchoStock
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your Firebase credentials and Google AI Studio Gemini API key:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_GEMINI_API_KEY=your_gemini_key
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/](http://localhost:5173/) in your browser.

4. **Build & Deploy**:
   ```bash
   npm run build
   firebase deploy --only hosting,firestore
   ```

---

## 🌐 Live Production URL
*Deployed Live URL: `https://YOUR_PROJECT_ID.web.app` (Placeholder — update after step 7 deployment)*
