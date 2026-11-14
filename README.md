# LogicLab – Digital Electronics Virtual Laboratory

Interactive web-based Digital IC Trainer Kit (`HI-TECH DIT9006`) built with Next.js (App Router), TypeScript, Tailwind CSS, Zustand, SVG, and Vitest.

## Local Installation & Development
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

## Automated Verification (Vitest)
```bash
npm test
```

## Production Build
```bash
npm run build
npm start
```

## GitHub & Vercel Deployment
1. Push the repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial LogicLab Digital Electronics Virtual Lab"
   git branch -M main
   git remote add origin https://github.com/<your-username>/logiclab.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com), click **Add New Project**, import your `logiclab` repository, and click **Deploy**. No environment variables or backend databases are required.
