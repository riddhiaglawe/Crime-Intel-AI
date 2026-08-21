# 🛡️ CrimeIntel - Next-Gen Police & FIR Crime Intelligence System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**CrimeIntel** is a modernized, full-stack crime intelligence, digital FIR management, and forensic correlation platform designed for law enforcement departments and citizen portals. Built with cutting-edge graph physics, voice-to-text intelligence, and AI-powered entity extraction, CrimeIntel bridges the gap between public grievance reporting and high-speed criminal investigation.

---

## 📌 Key Features

### 👮‍♂️ For Law Enforcement & Police Officers
* **Interactive CaseWeb Correlation Graph:** 2D canvas-based physics-driven entity network linking suspects, vehicles, phone numbers, weapons, and locations across multiple cases.
* **AI Crime Analysis & Lead Generation:** Automated case summarization, modus operandi analysis, and investigative lead discovery powered by Google Gemini.
* **FIR Filing & Case Lifecycle Tracking:** Multi-stage workflow covering FIR generation, evidence tagging, investigation status transitions, and charge-sheet preparation.
* **Forensic Evidence Locker:** Multi-media evidence storage supporting digital uploads, custody chain tracking, and real-time camera capture via MediaStream API.
* **Analytical Crime Dashboard & Clearance Metrics:** Real-time crime category breakdown, regional heatmaps, station-wise workload stats, and printable official FIR reports.

### 👥 For Citizens
* **Quick Incident & Grievance Reporting:** Streamlined citizen reporting interface with category-specific incident forms.
* **Voice-to-Text Incident Dictation:** Real-time speech transcription powered by Web Speech API for hands-free report drafting.
* **Live Complaint Tracking:** Status updates on filed grievances from submission to police verification and FIR conversion.

---

## 💻 Tech Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), TypeScript, Tailwind CSS, React |
| **Backend & Runtime** | Node.js, Express.js, Vite |
| **Database** | MongoDB Atlas / Cloud Persistence |
| **AI & NLP** | Google Gemini API (`@google/genai`) |
| **Browser APIs** | HTML5 Canvas 2D, Web Speech API, MediaStream Camera API, Web Crypto API |

---

## 🧠 Algorithms & Mathematical Models

* **Coulomb’s & Hooke’s Physics Engine:** Force-directed node repulsion and spring tension for dynamic CaseWeb suspect-evidence relationship visualization.
* **Trigonometric Polar-to-Cartesian Mapping:** Radial and orbital entity positioning for centralized suspect link analysis.
* **Cross-Case Entity Correlation Algorithm:** Automated matching across phone numbers, vehicle registrations, and aliases.
* **SHA-256 Cryptographic Hashing:** One-way password hashing via the Web Crypto API for secure authentication.
* **Spatio-Temporal Crime Aggregation:** Fast multi-attribute filtering and clearance rate calculations.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** or **bun** / **yarn**
* **MongoDB Atlas** Account & URI Connection String
* **Google Gemini API Key** (optional, for AI features)

---

## 📁 Project Structure

├── api/                # Serverless backend functions & MongoDB connection
├── css/                # Custom law enforcement stylesheets & theme variables
├── js/                 # Modular client-side business logic & engines
│   ├── app.js          # Core application controller & stats engine
│   ├── auth.js         # Role-based authentication & SHA-256 security
│   ├── cases.js        # FIR registry & case management logic
│   ├── citizen.js      # Citizen grievance portal & voice dictation
│   ├── correlation.js  # CaseWeb physics graph & entity linker
│   ├── evidence.js     # Evidence vault & digital asset handlers
│   ├── reports.js      # Statistical exports & print engine
│   └── suspects.js     # Suspect profiling & orbital link views
├── index.html          # Main application interface
├── package.json        # Dependencies and build scripts
└── README.md           # Project documentation
