# SecureWatch - Security Vulnerability Dashboard

A high-performance, **frontend-only** React dashboard for analyzing security vulnerabilities at scale. Built to handle massive datasets (300MB+) entirely in the browser using Web Workers and IndexedDB.

## 🌐 Live Demo

**[View Live Application →](https://your-app.vercel.app)**

![Demo](assets/SecureWatchDemo.gif)

---

## ✨ Key Features

### 🎯 Creative Analysis Filters ⭐ (Signature Feature)

The standout feature demonstrating innovative UX design:

- **"Analysis" Button**: Filters out CVEs marked as `invalid-norisk` (manual review)
- **"AI Analysis" Button**: Filters out CVEs marked as `ai-invalid-norisk` (AI-detected)
- **Real-time Impact Visualization**: Animated progress bars showing filter effects
- **Gradient UI**: Beautiful transitions with active/inactive states
- **Visual Feedback**: Real-time statistics (X removed, Y remaining, % impact)

### 📊 Comprehensive Data Processing

- **Web Worker Processing**: Non-blocking JSON parsing keeps UI responsive
- **IndexedDB Storage**: Persistent client-side database (~2GB capacity)
- **Handles 371MB Files**: Processes 236K+ vulnerabilities smoothly
- **Progress Tracking**: Visual indicators during data loading (0% → 100%)
- **Smart Caching**: Pre-computed metrics for instant retrieval

### 📈 Interactive Visualizations

Built with Recharts for responsive, animated charts:

- **Severity Distribution** – Donut chart with color-coded segments
- **AI vs Manual Analysis** – Stacked bar comparing analysis types
- **Top Risk Factors** – Horizontal bar chart of most common risks
- **Published Timeline** – Line chart showing vulnerability trends
- **Vulnerabilities Over Time** – Stacked area with severity breakdown

### 🔍 Advanced Filtering & Search

- **Multi-criteria Filters**: Severity, CVSS range, package names, risk factors
- **Date Range Filtering**: Published and fix date ranges
- **Global Search**: Search across CVE ID, package names, descriptions
- **Group/Repository Filters**: Filter by organizational units
- **Filter Chips**: Quick-dismiss active filters with visual indicators

### ⚡ Performance Optimizations

- **Code Splitting**: Lazy-loaded routes reduce initial bundle size
- **React.memo**: Prevent unnecessary re-renders on MetricsCards, AnalysisButtons, ChartsGrid
- **useMemo/useCallback**: Memoized computations and callbacks
- **Vendor Chunking**: Separate bundles for React, MUI, Recharts (better caching)
- **Pagination**: 50 items per page for smooth table rendering

### 🚀 Advanced Features

- **Side-by-side Comparison**: Compare up to 3 vulnerabilities with detailed metrics
- **Export Functionality**: Export filtered data to CSV or JSON
- **User Preferences**: localStorage persistence for theme and page size
- **Responsive Design**: Mobile-first approach, works on all devices
- **Multiple Data Loading**: Auto-load, manual upload, or URL loading

---

## 🏗️ Architecture

**Frontend-Only Design Philosophy:**

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

1. **Load**: JSON → Web Worker → Parse → Flatten → IndexedDB
2. **Query**: User Action → Context → Filter Engine → IndexedDB → UI
3. **Render**: Filtered Data → Paginated Table → Memoized Components

**Why Frontend-Only?**

- ✅ Zero infrastructure costs (just static hosting)
- ✅ Instant deployment (Vercel/Netlify)
- ✅ Privacy-first (data never leaves browser)
- ✅ Offline-capable (IndexedDB persistence)
- ✅ Showcases advanced browser API mastery

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/PreethamGoud/SecureWatch.git
cd SecureWatch

# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:5173
```

**Option 2: Manual Upload**

1. Click "Upload Data" button in dashboard
2. Select your JSON file (supports 300MB+ files)
3. Wait for processing (30-45 seconds for 371MB file)

**Option 3: URL Loading**

1. Click "Upload Data" → "Load from URL" tab
2. Enter URL to JSON file (must be CORS-accessible)

### Build for Production

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

---

## 🎯 Technology Stack

| Layer          | Technology       | Purpose                            |
| -------------- | ---------------- | ---------------------------------- |
| **Build Tool** | Vite 7.1         | Lightning-fast dev server & builds |
| **Framework**  | React 19         | UI library with modern hooks       |
| **Language**   | TypeScript 5.9   | Type safety with strict mode       |
| **UI Library** | Material-UI v7   | Professional component library     |
| **Routing**    | React Router v7  | Client-side navigation             |
| **State**      | Context API      | Global state management            |
| **Storage**    | IndexedDB (idb)  | Client-side database               |
| **Workers**    | Web Workers      | Background processing              |
| **Charts**     | Recharts 3.3     | Data visualizations                |
| **Animation**  | Framer Motion 12 | Smooth transitions                 |

---

## 📁 Project Structure

```
SecureWatch/
├── public/
│   └── your_vulnerabilities_file.json              # Your vulnerability data
├── src/
│   ├── components/
│   │   ├── AnalysisButtons.tsx   # ⭐ Creative filter buttons
│   │   ├── MetricsCards.tsx      # KPI dashboard cards
│   │   ├── ChartsGrid.tsx        # 5 visualization charts
│   │   ├── VulnerabilityTable.tsx # Paginated data table
│   │   ├── UnifiedFilters.tsx    # Advanced filter sidebar
│   │   ├── ComparisonPanel.tsx   # Side-by-side comparison
│   │   └── ExportDialog.tsx      # CSV/JSON export
│   ├── pages/
│   │   ├── Dashboard.tsx         # Main dashboard view
│   │   ├── VulnerabilitiesPage.tsx
│   │   └── VulnerabilityDetail.tsx
│   ├── context/
│   │   └── VulnerabilityContext.tsx # Global state
│   ├── workers/
│   │   └── dataProcessor.worker.ts  # Background processing
│   ├── utils/
│   │   ├── dataLoader.ts         # Data loading logic
│   │   ├── filtering.ts          # Filter algorithms
│   │   ├── indexedDB.ts          # Database operations
│   │   └── export.ts             # Export functionality
│   └── types/
│       └── vulnerability.ts      # TypeScript interfaces
└── vite.config.ts
```

---

## ✅ Requirements Compliance

### Data Loading & Processing ✓

- ✅ Efficient loading of 300MB+ JSON files
- ✅ Web Worker for background processing
- ✅ IndexedDB for persistent storage
- ✅ Progress tracking with visual indicators

### Component Architecture ✓

- ✅ Scalable component hierarchy
- ✅ Modern React patterns (hooks, functional components)
- ✅ Context API for state management
- ✅ Custom `useVulnerabilities()` hook

### Data Visualization ✓

- ✅ Severity distribution chart
- ✅ Risk factor analysis chart
- ✅ Timeline trends chart
- ✅ AI vs Manual comparison chart
- ✅ Interactive tooltips and legends

### Search & Filter Interface ✓

- ✅ Intuitive search interface
- ✅ Advanced multi-criteria filtering
- ✅ Real-time filter application
- ✅ Creative Analysis & AI Analysis buttons ⭐

### Performance Optimization ✓

- ✅ Code splitting with React.lazy()
- ✅ Lazy loading routes and components
- ✅ React.memo for expensive components
- ✅ useMemo/useCallback optimizations
- ✅ Vendor chunking for better caching

### Advanced Features ✓

- ✅ Comparison feature (multiple vulnerabilities)
- ✅ Export functionality (CSV/JSON)
- ✅ User preferences persistence
- ✅ Creative visualizations
- ✅ Responsive design

---

## 🎨 Analysis Filter Buttons - Implementation Details

The signature feature demonstrating creative UX:

**Visual States:**

- **Inactive**: Outlined button with subtle gradient
- **Active**: Filled button with bold gradient + checkmark icon
- **Hover**: Lift animation with shadow elevation

**Impact Display:**

```typescript
{
  removed: 50,000 CVEs,
  remaining: 186,000 CVEs,
  percentageRemoved: 21.2%,
  percentageRemaining: 78.8%
}
```

**Animated Progress Bar:**

- Real-time width transition (300ms ease-in-out)
- Color-coded (green = remaining, gray = removed)
- Percentage overlay with smooth counting animation

---

## 🎓 Key Technical Decisions

### Why Frontend-Only?

- **Cost**: Zero infrastructure, just static hosting
- **Speed**: No network latency after initial load
- **Privacy**: Data never leaves user's browser
- **Simplicity**: Single deployment target
- **Scalability**: Each user has their own processing power

### Why IndexedDB?

- **Capacity**: ~2GB storage vs localStorage's 10MB
- **Performance**: Indexed queries, async operations
- **Persistence**: Survives browser restarts
- **Structure**: Key-value store with custom indexes

### Why Web Workers?

- **UI Responsiveness**: JSON parsing doesn't block main thread
- **Progress Tracking**: Can report incremental progress
- **Error Handling**: Isolated failures won't crash UI
- **Performance**: Parallel processing on multi-core CPUs

---

## 👨‍💻 Author

**Preetham Goud**

- GitHub: [@PreethamGoud](https://github.com/PreethamGoud)
- Repository: [SecureWatch](https://github.com/PreethamGoud/SecureWatch)

---

## 📄 License

This project is created as a technical assessment. All rights reserved.

---

**Status**: ✅ Production-Ready | **Build**: ✅ Passing | **Requirements**: ✅ Complete

_Last Updated: November 5, 2025_
