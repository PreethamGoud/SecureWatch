# Quick Setup Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Dev Server

```bash
npm run dev
```

Open http://localhost:5173

### 3. Load Data

**Option A: Auto-load**

- Place `ui_demo.json` in `public/` folder
- Refresh page

**Option B: Manual upload**

- Click "Upload Data" button
- Select your JSON file

---

## 📦 What's Included

✅ **Web Worker** for background processing  
✅ **IndexedDB** for persistent storage  
✅ **Creative Analysis Filters** with visual feedback  
✅ **Material-UI** responsive design  
✅ **Virtual Scrolling** for large datasets  
✅ **TypeScript** type safety

## 🎯 Key Features to Test

1. **Analysis Buttons** - Click to filter invalid CVEs
2. **Impact Visualization** - See real-time filter statistics
3. **Vulnerability Table** - Smooth scrolling through thousands of rows
4. **Responsive Design** - Resize browser or test on mobile

## 📊 Expected Performance

- **Initial Load**: 30-45 seconds (371MB file)
- **Filter Updates**: <100ms
- **Table Rendering**: <50ms
- **Memory Usage**: ~500MB

## 🛠️ Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📁 Where to Find Key Code

- **Analysis Buttons**: `src/components/AnalysisButtons.tsx`
- **Data Processing**: `src/workers/dataProcessor.worker.ts`
- **IndexedDB**: `src/utils/indexedDB.ts`
- **Filtering Logic**: `src/utils/filtering.ts`
- **Main Dashboard**: `src/pages/Dashboard.tsx`

## 🐛 Troubleshooting

**"Failed to load data"**

- Check file is in `public/` folder
- Or use manual upload button

**"Slow loading"**

- First load takes 30-45 seconds for 371MB
- Subsequent loads instant (IndexedDB cache)

**"Memory issues"**

- Large file (~500MB memory)
- Close other tabs if needed

## 🎨 Customize

**Change Theme**

- Edit `src/theme/theme.ts`

**Add Charts**

- Recharts already installed
- Templates in `src/components/ChartsGrid.tsx`

**Modify Filters**

- Edit `src/utils/filtering.ts`

---

**Need Help?** Check the full README.md for detailed documentation!
