# 🛡️ CrimeIntel AI

### AI-Powered Criminal Analysis, Evidence Correlation, And Possible Suspect Detection System 

CrimeIntel AI is a web-based **criminal intelligence and case analysis platform** designed to help law-enforcement teams organize cases, analyze evidence, identify suspect correlations, and discover relationships across multiple investigations.

The system combines **AI-assisted analysis, evidence correlation, suspect scoring, cross-case pattern detection, legal provision analysis, and citizen complaint management** into a unified platform.

## 🚀 Live Demo

🔗 **[CrimeIntel AI – Live Demo](https://crime-intel-ai-8lhq.onrender.com)**

> Explore the deployed application directly from the link above.

---

## ✨ Key Features

### 👮 Police Intelligence Dashboard

* Centralized police intelligence dashboard
* Case management and monitoring
* Active, critical, cold, and resolved case tracking
* Suspect management
* Evidence management
* Investigation activity logs

### 🤖 AI-Powered Case Analysis

* AI-assisted crime investigation
* Automated evidence correlation
* Suspect scoring and ranking
* Pattern identification
* Cross-case relationship detection
* AI-generated analysis logs

### 🔗 Evidence Correlation Engine

CrimeIntel AI analyzes relationships between evidence and suspects using similarity-based techniques.

The system implements:

**Jaccard Similarity**

```text
J(A,B) = |A ∩ B| / |A ∪ B|
```

**Cosine Similarity**

```text
C(A,B) = (A · B) / (||A|| ||B||)
```

**Jaccard-Cosine Relationship**

```text
JCOS(A,B) = J(A,B) × C(A,B)
```

These techniques help identify common patterns and relationships between evidence items and criminal cases.

### 🎯 Suspect Correlation & Scoring

* Evidence-to-suspect matching
* Correlation confidence scoring
* High-priority suspect identification
* Shared evidence/tag detection
* Cross-case suspect relationships

### 🕸️ Correlation Web

The platform provides a visual relationship graph connecting:

```text
Cases
  ↓
Evidence
  ↓
Suspects
  ↓
Shared Patterns
  ↓
Related Cases
```

This helps investigators understand complex relationships within and across investigations.

### 📁 Evidence Management

* Evidence logging
* Evidence categorization
* Evidence filtering
* File attachments
* Case-based evidence organization

### 👤 Suspect Management

* Suspect profiles
* Suspect evidence relationships
* Correlation scores
* Cross-case detection
* Investigation history

### ⚖️ Legal Provision Analysis

* Legal provision management
* Provision acceptance/rejection
* Custom legal provisions
* Re-analysis of applicable provisions
* Complaint assessment report generation

### 🧑‍💼 Citizen Portal

Citizens can:

* Submit complaints
* Upload evidence
* Track complaints
* View complaint status
* Provide supporting information
* Capture evidence using camera
* Use speech input for complaint submission

### 🌓 Modern UI

* Light and Dark themes
* Responsive interface
* Interactive dashboards
* Modern law-enforcement inspired design
* Interactive modals and navigation
* Visual analytics

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │     CrimeIntel AI    │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       Police Portal     Citizen Portal    AI Analysis
              │                │                │
              ▼                ▼                ▼
        Case Management   Complaints      Correlation
        Evidence          Evidence        Engine
        Suspects          Tracking        Scoring
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                    ┌──────────────────────┐
                    │ Intelligence Layer  │
                    │                     │
                    │ Jaccard Similarity  │
                    │ Cosine Similarity   │
                    │ JCOS Relationship   │
                    │ Cross-Case Analysis │
                    └──────────────────────┘
```

---

## 🧰 Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript
* React
* Vite
* Tailwind CSS
* Lucide React
* Motion

### Backend & Services

* Node.js
* Express.js
* MongoDB
* CORS
* Helmet
* Express Rate Limit

### AI

* Google Gemini API
* AI-assisted case analysis
* Evidence correlation
* Pattern detection

### Additional Libraries

* jsPDF
* html2canvas
* dotenv
* TypeScript

---

## 📂 Project Structure

```text
CrimeIntel_AI/
│
├── assets/
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── cases.js
│   ├── citizen.js
│   ├── correlation.js
│   ├── data.js
│   ├── dataset.js
│   ├── evidence.js
│   ├── legal-provisions.js
│   ├── remote-store.js
│   ├── reports.js
│   ├── router.js
│   ├── suspects.js
│   ├── theme.js
│   └── ui.js
│
├── dist/
│
├── index.html
├── metadata.json
├── package.json
├── bun.lock
├── .env.example
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/CrimeIntel_AI.git
```

### 2. Navigate to the Project

```bash
cd CrimeIntel_AI
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create your environment configuration using the provided example:

```bash
cp .env.example .env
```

Add the required API keys and configuration values to your `.env` file.

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

### 6. Build for Production

```bash
npm run build
```

---

## 🔐 Security Features

CrimeIntel AI incorporates several security-oriented mechanisms including:

* Role-based access
* Authentication
* Session management
* Helmet security headers
* CORS configuration
* Rate limiting
* Environment-based configuration
* Controlled access to investigation data

> This project is intended as an academic/prototype intelligence platform and should not be used as a production law-enforcement system without appropriate security, privacy, legal, and operational validation.

---

## 📊 Core Intelligence Workflow

```text
1. Register / Login
        ↓
2. Access Intelligence Dashboard
        ↓
3. Select or Create Case
        ↓
4. Add Evidence
        ↓
5. Add / Review Suspects
        ↓
6. Run AI Correlation
        ↓
7. Calculate Similarity
        ↓
8. Generate Suspect Scores
        ↓
9. Detect Cross-Case Patterns
        ↓
10. Review Intelligence Results
        ↓
11. Generate Reports
```

---

## 🎯 Project Objectives

The main objectives of CrimeIntel AI are:

* Reduce manual effort in crime investigation
* Organize criminal intelligence in one platform
* Identify hidden relationships between evidence and suspects
* Detect patterns across multiple cases
* Assist investigators with data-driven insights
* Improve evidence management
* Provide citizens with a structured complaint portal
* Demonstrate practical applications of AI and similarity algorithms in cybersecurity and criminal intelligence

---

## 🔬 Intelligence Scoring

The suspect correlation engine evaluates shared evidence characteristics.

A configurable weighting factor is used to reduce the impact of weak matches:

```text
Score = 8 + 92 × M / [M + α(E − M)]
```

Where:

```text
M = Number of matched evidence items
E = Total evidence items
α = Weighting factor
```

The resulting score helps prioritize suspects for further investigation.

> The score is an analytical aid and should not be interpreted as proof of criminal activity or guilt.

---

## 🌟 Highlights

* 🤖 AI-powered investigation assistance
* 🔍 Evidence correlation
* 🧠 Intelligent suspect scoring
* 🔗 Cross-case pattern detection
* 🕸️ Interactive correlation web
* ⚖️ Legal provision analysis
* 👮 Police intelligence dashboard
* 🧑‍💼 Citizen complaint portal
* 📄 Report generation
* 🌓 Light/Dark mode
* 🔐 Security-focused architecture
* 📱 Responsive modern interface

---

## 🎓 Academic Project

**CrimeIntel AI** was developed as an academic/project implementation demonstrating the integration of:

* Artificial Intelligence
* Cybersecurity
* Criminal Intelligence
* Data Analysis
* Similarity Algorithms
* Web Development
* Evidence Correlation
* Case Management

The project demonstrates how computational techniques can assist investigators in organizing and analyzing large amounts of case-related information.

---

## ⚠️ Disclaimer

CrimeIntel AI is a **research/academic prototype**.

The system does not establish guilt, innocence, or legal liability. AI-generated results and correlation scores should be treated only as decision-support information and must be verified by qualified investigators and appropriate legal authorities.

---

## 👨‍💻 Author

**CrimeIntel AI Project**

Built with a focus on **AI, cybersecurity, criminal intelligence, and intelligent data analysis.**

---

## ⭐ Support

If you find this project interesting, consider giving the repository a ⭐ on GitHub.

### 🔗 Live Application

**[Launch CrimeIntel AI](https://crime-intel-ai-8lhq.onrender.com)**
