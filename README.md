<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/aba62776-46ad-4f3e-9bb0-f418392101c8

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Set `MONGODB_URI` in [.env.local](.env.local) to your MongoDB Atlas connection string (see [.env.example](.env.example))
4. Run the app:
   `npm run dev`

## Data storage

All application data (cases, citizen applications, evidence, suspects, users, activity)
is stored in MongoDB Atlas through the `/api/state` endpoint, in the `crimeintel.app_state`
collection. The browser keeps a localStorage copy as an offline cache, so the app still
works unchanged if the database is unreachable.

Production: `npm run build && npm start` (serves `dist/` plus the API on `PORT`, default 3000).
