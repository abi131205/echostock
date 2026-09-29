# EchoStock — A photo becomes real-time stock data. A digital twin predicts the next outbreak.

**Team Kryxen**: Abijith UK (Team Lead)  
**Event**: Build With AI: Code for Communities 2nd Edition (hack2skill × Google Cloud)  
**Problem Statement 3**: Smart Health & Supply Chain Resilience  

---

## 📌 The Problem

Primary Health Centre (PHC) supply chains in India suffer from severe data latency. Busy healthcare workers have no time to log stock numbers into complex forms, leading to skipped data entry and blind spots across district health networks. As a result, critical medicine shortages are discovered only after shelves are completely empty, leaving communities vulnerable during sudden epidemic outbreaks.

---

## ⚡ The Two Mechanisms

EchoStock turns every health worker's smartphone into a sensor for a resilient health network through two core mechanisms:

1. **Photo-to-Stock Intake**: A health worker snaps a photo of a medicine shelf. Google Gemini 3.5 AI Vision reads stock levels automatically with zero manual data entry required. A human-in-the-loop confirmation table lets staff verify or edit counts before writing directly to the network.
2. **Digital Twin Outbreak Simulator**: A simulated model of the PHC network allows district coordinators to run "what-if" epidemic scenarios (e.g., *Dengue spike (+60% surge)*) to forecast shortfalls before they happen. Shortfall alerts feed directly into a Haversine distance-weighted greedy redistribution engine to pre-position stock before crisis strikes.

---

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Visualization**: Recharts 2.x (Interactive demand vs stock charts)
- **AI Vision Engine**: Google AI Studio Gemini API (`gemini-3.5-flash` multimodal)
- **Database & Sync**: Firebase Firestore (Spark / Free Plan — real-time `onSnapshot` listeners)
- **Hosting**: Firebase Hosting (Single-Page Application rewrite rules)

---

## 🌐 Live Demo & Repository Links

- **Live Deployed App**: [https://echostock-c6e16.web.app](https://echostock-c6e16.web.app)
- **GitHub Repository**: [https://github.com/abi131205/echostock](https://github.com/abi131205/echostock)

---

## 📸 Screenshots & UI Preview

*(Place screenshot images in `/docs/screenshots/` or `/assets/`)*

- **Live Network Dashboard**: Overview of district PHCs with color-coded risk status badges (`Critical`, `Low`, `Healthy`).
- **Photo Intake & Gemini Vision**: WhatsApp-styled intake screen displaying Gemini 3.5 extracted stock counts and confidence scores.
- **Outbreak Twin & Redistribution**: Interactive demand surge forecast chart and Haversine distance-calculated transfer recommendations.

---

## 💻 How to Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/abi131205/echostock.git
cd echostock

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Fill in your Firebase config & Gemini API Key (VITE_GEMINI_API_KEY) in .env

# 4. Start local development server
npm run dev
```

Navigate to `http://localhost:5173/` in your browser.

---

## 🗄 Data Model (Firestore Collections)

- `/phcs/{phcId}`: PHC metadata (name, district, state, GPS lat/lng, bed capacity, staff attendance).
- `/phcs/{phcId}/stock/{medicineId}`: Real-time stock levels, reorder thresholds, and update source (`photo` vs `manual`).
- `/stockReports/{reportId}`: History of AI vision extractions (parsed stock items, raw model response, timestamps).
- `/simulations/{simulationId}`: Outbreak simulation runs (district, scenario type, demand multipliers, results).
- `/redistributions/{redistributionId}`: Recommended and approved stock transfer orders across PHC nodes.

---

## 📜 Notes & Aspirational Roadmap

This repository represents the working MVP slice engineered during the 2-day hackathon sprint. The aspirational national-scale federated architecture described in the pitch deck (involving WhatsApp Business API integration, Vertex AI forecasting, and state-wide BigQuery data lakes) represents the long-term vision beyond this 2-day build.
