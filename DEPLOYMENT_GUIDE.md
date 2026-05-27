# 🚀 Deployment Guide - ClassRep Attendance Manager

## Quick Start - Deploy in 5 Minutes

### Option 1: Deploy to Vercel (Recommended) ⚡

1. **Install Vercel CLI (if not installed)**
   ```bash
   npm install -g vercel
   ```

2. **Build the project**
   ```bash
   pnpm install
   pnpm build
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
4. **Follow prompts:**
   - Set up and deploy → Yes
   - Which scope? → Your account
   - Link to existing project? → No
   - Project name → classrep-attendance
   - Directory → ./
   - Override settings? → No

5. **Production deployment**
   ```bash
   vercel --prod
   ```

**Done!** Your app is live at `https://classrep-attendance.vercel.app`

---

### Option 2: Deploy to Netlify 🌐

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**
   ```bash
   pnpm install
   pnpm build
   ```

3. **Deploy**
   ```bash
   netlify deploy
   ```

4. **Follow prompts:**
   - Create new site → Yes
   - Team → Your team
   - Site name → classrep-attendance
   - Publish directory → dist

5. **Production deployment**
   ```bash
   netlify deploy --prod
   ```

**Done!** Your app is live at `https://classrep-attendance.netlify.app`

---

### Option 3: GitHub Pages 📄

1. **Add to package.json:**
   ```json
   {
     "scripts": {
       "deploy": "pnpm build && gh-pages -d dist"
     }
   }
   ```

2. **Install gh-pages**
   ```bash
   pnpm add -D gh-pages
   ```

3. **Update vite.config.ts** (add base path):
   ```typescript
   export default defineConfig({
     base: '/repo-name/', // Replace with your repository name
     // ... rest of config
   })
   ```

4. **Deploy**
   ```bash
   pnpm deploy
   ```

5. **Enable GitHub Pages:**
   - Go to repository Settings
   - Pages → Source → gh-pages branch
   - Save

**Done!** Your app is live at `https://username.github.io/repo-name/`

---

## ⚙️ Configuration Files (Already Set Up)

### ✅ vercel.json
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
**Purpose:** Handles SPA routing for Vercel

### ✅ netlify.toml
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
**Purpose:** Handles SPA routing for Netlify

### ✅ public/_redirects
```
/*    /index.html   200
```
**Purpose:** Fallback for Netlify

### ✅ public/404.html
**Purpose:** Fallback for GitHub Pages SPA routing

---

## 🔧 Build Configuration

### Vite Build Settings
```typescript
// vite.config.ts
build: {
  outDir: 'dist',
  sourcemap: false,
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router'],
        'ui-vendor': ['motion', 'lucide-react'],
      },
    },
  },
}
```

**Output:**
- `dist/` - Production build directory
- Code splitting enabled
- Optimized bundles
- Tree-shaking enabled

---

## 📦 Environment Setup

### Required Dependencies
All dependencies are in `package.json`. Install with:
```bash
pnpm install
```

### Optional Environment Variables
None required - app uses localStorage for all data.

---

## 🧪 Pre-Deployment Testing

### 1. Local Build Test
```bash
pnpm build
pnpm preview
```
Open http://localhost:4173

### 2. Check Build Output
```bash
ls -la dist/
```
Should see:
- `index.html`
- `assets/` directory with JS/CSS bundles
- `404.html`
- `_redirects`

### 3. Test Routes Locally
Navigate to:
- http://localhost:4173/
- http://localhost:4173/app
- http://localhost:4173/app/students
- http://localhost:4173/app/timetable

All should load correctly.

---

## 🐛 Troubleshooting

### Issue: Routes return 404 after refresh

**Vercel:**
- ✅ Check `vercel.json` exists
- ✅ Verify rewrite rule is present

**Netlify:**
- ✅ Check `netlify.toml` exists
- ✅ Check `public/_redirects` exists
- ✅ Verify redirect rule is present

**GitHub Pages:**
- ✅ Check `public/404.html` exists
- ✅ Verify `base` path in vite.config.ts matches repo name

### Issue: Buttons not clickable

**Fixed!** The `.gradient-bg::before` overlay issue has been resolved.
- ✅ Check `src/styles/glassmorphism.css` has `pointer-events: none`

### Issue: Assets not loading

**Check:**
- ✅ Build completed successfully
- ✅ `dist/assets/` directory exists
- ✅ No hardcoded asset paths in code

### Issue: White screen on deployment

**Check:**
- ✅ Browser console for errors
- ✅ Network tab for failed requests
- ✅ Base path configuration
- ✅ vercel.json/netlify.toml present

---

## 📊 Build Size Analysis

### Expected Bundle Sizes:
- Main bundle: ~200-300 KB (gzipped)
- React vendor: ~130 KB (gzipped)
- UI vendor: ~80 KB (gzipped)
- CSS: ~20-30 KB (gzipped)

### Optimize Further:
```bash
# Analyze bundle
pnpm build
npx vite-bundle-visualizer
```

---

## 🔒 Security Checklist

### Before Deployment:
- [x] No API keys in code
- [x] No sensitive data hardcoded
- [x] HTTPS enabled (automatic on Vercel/Netlify)
- [x] LocalStorage encryption not needed (demo data only)
- [x] No CORS issues
- [x] Content Security Policy headers (optional)

---

## 🚀 Deployment Checklist

### Before Deploying:
- [ ] Run `pnpm build` locally - succeeds
- [ ] Run `pnpm preview` - app works
- [ ] Test all routes in preview
- [ ] Test all buttons/interactions in preview
- [ ] Check browser console - no errors
- [ ] Check network tab - all assets load
- [ ] Test on mobile device/emulator
- [ ] Git commit all changes
- [ ] Push to repository

### After Deploying:
- [ ] Visit production URL
- [ ] Test all routes
- [ ] Refresh on different pages
- [ ] Test navigation
- [ ] Test forms
- [ ] Test modals
- [ ] Check mobile responsiveness
- [ ] Verify dark/light theme
- [ ] Test LocalStorage persistence

---

## 🎯 Performance Optimization

### Already Configured:
- ✅ Code splitting
- ✅ Tree shaking
- ✅ Minification
- ✅ CSS optimization
- ✅ Asset compression

### Optional Enhancements:
- [ ] Add service worker for offline support
- [ ] Add meta tags for SEO
- [ ] Add Open Graph tags for social sharing
- [ ] Configure CDN caching headers
- [ ] Add analytics (Google Analytics, Plausible, etc.)

---

## 📱 Platform-Specific Notes

### Vercel
**Pros:**
- Automatic HTTPS
- Global CDN
- Zero config
- Preview deployments
- Serverless functions support (if needed later)

**Limits:**
- Free tier: 100 GB bandwidth/month
- 1000 builds/month

### Netlify
**Pros:**
- Automatic HTTPS
- Global CDN
- Form handling
- Split testing
- Deploy previews

**Limits:**
- Free tier: 100 GB bandwidth/month
- 300 build minutes/month

### GitHub Pages
**Pros:**
- Free hosting
- Integrated with GitHub
- Custom domain support

**Cons:**
- No server-side rendering
- Requires base path configuration
- Manual deployment process

---

## 🔄 Continuous Deployment

### Vercel
```bash
# Link repository
vercel link

# Auto-deploys on git push to main
git push origin main
```

### Netlify
```bash
# Link repository
netlify link

# Auto-deploys on git push to main
git push origin main
```

### GitHub Pages
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 🎉 Post-Deployment

### Share Your App:
- Copy production URL
- Share with users
- Add to README.md
- Tweet about it! 🐦

### Monitor:
- Check Vercel/Netlify dashboard
- Monitor bandwidth usage
- Check build logs for warnings
- Review user feedback

---

## 📞 Support

### Documentation:
- **Vercel:** https://vercel.com/docs
- **Netlify:** https://docs.netlify.com
- **GitHub Pages:** https://pages.github.com

### Issues:
If you encounter issues:
1. Check browser console
2. Check network tab
3. Review configuration files
4. Check platform status pages
5. Verify DNS settings (for custom domains)

---

## ✅ Deployment Success Criteria

Your deployment is successful when:
- [x] App loads at production URL
- [x] All routes accessible
- [x] Browser refresh works on any page
- [x] All buttons/links functional
- [x] Forms submit correctly
- [x] Modals open/close
- [x] Navigation works smoothly
- [x] Mobile responsive
- [x] No console errors
- [x] Assets load correctly

---

**🚀 READY TO DEPLOY! 🎉**

Choose your platform and follow the steps above. Good luck!
