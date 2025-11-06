# SecureWatch - Security Vulnerability Dashboard

A high-performance, frontend-only React dashboard for analyzing security vulnerabilities at scale. Built to handle massive datasets (300MB+) entirely in the browser using Web Workers and IndexedDB.

## Live Demo

**[View Live Application](https://your-app.vercel.app)**

![Demo](assets/SecureWatchDemo.gif)

## Key Features

### Creative Analysis Filters (Signature Feature)

Innovative UX design for vulnerability filtering:

- **Analysis Button**: Filters out CVEs marked as `invalid-norisk` (manual review)
- **AI Analysis Button**: Filters out CVEs marked as `ai-invalid-norisk` (AI-detected)
- **Real-time Impact Visualization**: Animated progress bars showing filter effects
- **Visual Feedback**: Live statistics showing removed/remaining CVEs and percentage impact

### Core Capabilities

- **Web Worker Processing**: Non-blocking JSON parsing for responsive UI
- **IndexedDB Storage**: Persistent client-side database with ~2GB capacity
- **Large File Support**: Handles 371MB files with 236K+ vulnerabilities
- **Interactive Charts**: Severity distribution, risk factors, timeline trends, AI vs manual analysis
- **Advanced Filtering**: Multi-criteria search, date ranges, severity levels, package names
- **Side-by-side Comparison**: Compare up to 3 vulnerabilities simultaneously
- **Export Functionality**: Export filtered data to CSV or JSON
- **Responsive Design**: Works seamlessly on all devices

## Architecture

**Frontend-Only Design:**

```
┌─────────────────────────────────────────────┐
│         React Application (Browser)         │
├─────────────────────────────────────────────┤
│  Components (Material-UI) + React Router    │
├──────────────┬──────────────┬───────────────┤
│  Web Worker  │  IndexedDB   │   Filtering   │
│ (Processing) │  (Storage)   │  (Algorithms) │
└──────────────┴──────────────┴───────────────┘
              ↑
        your_vulnerabilities_file.json
```

**Data Flow:**

1. Load: JSON → Web Worker → Parse → IndexedDB
2. Query: User Action → Filter Engine → IndexedDB → UI
3. Render: Filtered Data → Paginated Table → Components

**Benefits:**

- Zero infrastructure costs
- Instant deployment
- Privacy-first (data never leaves browser)
- Offline-capable

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/PreethamGoud/SecureWatch.git
cd SecureWatch
npm install
npm run dev
```

Visit http://localhost:5173

### Build for Production

```bash
npm run build
npm run preview
```

## Technology Stack

- **Build Tool**: Vite 7.1
- **Framework**: React 19
- **Language**: TypeScript 5.9
- **UI Library**: Material-UI v7
- **Routing**: React Router v7
- **State Management**: Context API
- **Storage**: IndexedDB (idb)
- **Charts**: Recharts 3.3
- **Animation**: Framer Motion 12

## Project Structure

```
SecureWatch/
├── public/
│   └── your_vulnerabilities_file.json
├── src/
│   ├── components/
│   │   ├── AnalysisButtons.tsx
│   │   ├── MetricsCards.tsx
│   │   ├── ChartsGrid.tsx
│   │   ├── VulnerabilityTable.tsx
│   │   ├── UnifiedFilters.tsx
│   │   ├── ComparisonPanel.tsx
│   │   └── ExportDialog.tsx
│   ├── pages/
│   ├── context/
│   ├── workers/
│   ├── utils/
│   └── types/
└── vite.config.ts
```

## Key Technical Decisions

**Why Frontend-Only?**

- Zero infrastructure costs
- No network latency after initial load
- Complete data privacy
- Simple deployment

**Why IndexedDB?**

- 2GB storage capacity
- Indexed queries for fast retrieval
- Persists across browser sessions

**Why Web Workers?**

- Non-blocking UI during data processing
- Progress tracking capability
- Parallel processing on multi-core CPUs

## Author

**Preetham Goud**

- GitHub: [@PreethamGoud](https://github.com/PreethamGoud)
- Repository: [SecureWatch](https://github.com/PreethamGoud/SecureWatch)

## License

This project is created as a technical assessment. All rights reserved.

---

_Last Updated: November 5, 2025_
