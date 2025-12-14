# LAWA – ITF Curbside Performance Dashboard

A production-quality React + TypeScript + Tailwind CSS dashboard application for airport curbside operations monitoring and analytics.

## Features

- **Live Ops Dashboard**: Real-time operations monitoring with KPIs, zone maps, and alerts
- **Curb Analytics**: INRIX-style curb use analysis with blockface mapping and parking schedules
- **Performance Insights**: Scenario comparison and throughput analysis

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Tech Stack

- React 18 + TypeScript
- Tailwind CSS for styling
- Recharts for data visualization
- React Router for navigation
- Vite for build tooling

## Project Structure

```
src/ ├── components/ │   ├── common/          # Reusable UI components │   ├── liveops/         # Live Ops Dashboard components │   ├── curbanalytics/   # Curb Analytics components │   └── performance/     # Performance Insights components ├── hooks/ │   ├── useITFMetrics.ts # Main data hook with seeded random generator │   └── useCurrentTime.ts # Current time hook ├── layouts/ │   └── MainLayout.tsx   # Main app layout with navigation ├── pages/ │   ├── LiveOpsDashboard.tsx │   ├── CurbAnalyticsPage.tsx │   └── PerformanceInsightsPage.tsx ├── types.ts             # TypeScript type definitions ├── App.tsx └── main.tsx
```

## Data

The application uses a mock data layer with a seeded pseudo-random generator for deterministic, consistent data across reloads. Data updates every 5 seconds with slight perturbations. Enable "Demo Mode" for increased volatility.


