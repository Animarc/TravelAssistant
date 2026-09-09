# Tabiji Log

A shared travel log where people discover proven routes, organise their trips, and pass practical knowledge on to future travellers. Built with React, TypeScript, and Vite.

## Features

- **Trip Planning**: Organize activities day by day with time, location, and cost tracking
- **Budget Management**: Track expenses for activities, accommodations, and purchases
- **Packing List**: Checklist for travel essentials organized by category
- **Interactive Map**: View locations on an interactive Leaflet map
- **Multi-language**: Support for ES, EN, FR, DE, ZH, RU, JA
- **Secure sessions**: short-lived access tokens in memory and refresh through an HttpOnly cookie

## Tech Stack

- React 18
- TypeScript
- Vite
- Leaflet for maps
- React Router for addressable application views
- Vitest and Testing Library for regression tests

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run lint, tests and the production build
npm run check

# Build for production
npm run build

# Preview production build
npm run preview
```

The Session API must be available at `http://localhost:5010` and the Travels API at
`http://localhost:5101`, unless overridden in a local `.env` file.

When an API contract changes, start both APIs and regenerate the checked-in TypeScript contracts:

```bash
npm run api:generate
```

## Deployment

The app is configured for automatic deployment to GitHub Pages via GitHub Actions.

1. Push to the `main` branch
2. GitHub Actions will build and deploy automatically
3. Access at: `https://tabijilog.com/`

### Manual deployment

```bash
npm run deploy
```

## Configuration

Copy `.env.example` to `.env.local` to override local API addresses. The GitHub Pages base path
remains configured in `vite.config.ts` while this repository is deployed there.

## License

MIT
