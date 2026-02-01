# InFrame Studio

**AI-Powered Production Risk Intelligence Platform**

InFrame Studio is a decision-support system for film production, combining deterministic rule-based engines with Generative AI to manage production risks, resolve crises, and optimize logistics.

## 🚀 Features

### 1. Scene Intelligence
- **AI-Driven Analysis:** Extracts technical parameters (weather sensitivity, crew size, stunt risk) from natural language scene descriptions.
- **Risk Profiling:** Deterministic scoring engine calculates risk levels based on 5 independent factors.
- **Advisory Narratives:** Generates producer-friendly risk summaries using Azure OpenAI.

### 2. Crisis Decision Engine (Plan-B)
- **Rescue Planning:** Generates ranked "Plan B" options when a crisis (e.g., Weather, Actor Injury) hits.
- **Trade-off Analysis:** Evaluates options based on Budget, Timeline, and Creative Impact.
- **Smart Ranking:** Uses a weighted scoring algorithm to recommend the best path forward.

### 3. Spatial Feasibility
- **Location Scoring:** Evaluates shooting locations for technical readiness.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, CSS Modules (Cinema-inspired Light Theme)
- **Backend:** Node.js, Express
- **AI Integration:** Azure OpenAI Service (GPT-4o, DALL-E/Flux)
- **Architecture:** Decoupled "Intelligence Layers" (Scene, Spatial, Decision)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16+)
- Azure OpenAI API Key

### 1. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
OPENAI_API_KEY=your_azure_openai_key_here
```

Start the server:
```bash
npm start
# Server runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

## ⚠️ Disclaimer
This tool provides **decision support only**. All risk assessments and rescue plans should be verified by experienced production personnel.
