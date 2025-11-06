# Deploy to Vercel

## Quick Deploy

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Optimize file upload and cache clearing"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Add New Project"
   - Import your `SecureWatch` repository
   - Vercel will auto-detect Vite settings
   - Click "Deploy"

That's it! Vercel will automatically:
- Install dependencies
- Build the project
- Deploy to a production URL

## After Deployment

Your app will be live at: `https://your-project.vercel.app`

To upload data:
1. Click the upload button
2. Choose your JSON file
3. Data is stored in browser IndexedDB (client-side only)

## Notes

- No server needed - fully client-side app
- Data stays in user's browser
- Each user must upload their own data file
- Supports large JSON files (handled via Web Workers)
