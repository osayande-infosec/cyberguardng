Netlify deployment notes
------------------------

This repository contains a Vite React app in the `react-site` folder.

Quick deploy steps (Netlify):

- In Netlify, connect your Git repository and choose the branch to deploy (usually `main` or `master`).
- Set the "Base directory" to: `react-site`
- Set the build command to: `npm run build`
- Set the publish directory to: `react-site/dist`
- (Optional) Set environment variable `NODE_VERSION=18` or leave default.
 - Set environment variable `OPENAI_API_KEY` to your OpenAI API key (required for the built-in chatbot serverless function).

Local verification:

```powershell
cd ./react-site
npm ci
npm run build
# Result: `dist/` directory containing static site ready for Netlify
```

Notes:
- `netlify.toml` at repo root is configured to use `react-site` as the base and will also create a SPA redirect to `index.html`.
