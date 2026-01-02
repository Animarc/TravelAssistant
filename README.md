# Travel Assistant

A modern travel planning application built with React, TypeScript, and Vite.

## Features

- **Trip Planning**: Organize activities day by day with time, location, and cost tracking
- **Budget Management**: Track expenses for activities, accommodations, and purchases
- **Packing List**: Checklist for travel essentials organized by category
- **Interactive Map**: View locations on an interactive Leaflet map
- **Multi-language**: Support for ES, EN, FR, DE, ZH, RU, JA
- **Observability**: Integrated with Grafana Faro for frontend monitoring

## Tech Stack

- React 18
- TypeScript
- Vite
- Leaflet for maps
- Grafana Faro for observability

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The app is configured for automatic deployment to GitHub Pages via GitHub Actions.

1. Push to the `main` branch
2. GitHub Actions will build and deploy automatically
3. Access at: `https://yourusername.github.io/TravelAssistant-React/`

### Manual deployment

```bash
npm run deploy
```

## Configuration

Update the `base` in `vite.config.ts` to match your repository name:

```ts
export default defineConfig({
  base: '/your-repo-name/',
  // ...
})
```

## License

MIT
