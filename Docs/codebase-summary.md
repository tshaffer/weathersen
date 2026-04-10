# Weathersen — Codebase Summary

## Overview

**Weathersen** is a full-stack weather forecasting application for trip planning. Users build an itinerary with multiple stops at different locations, and the app displays weather forecasts for each stop on its corresponding date. Location search is powered by the Google Places Autocomplete API, and weather data comes from the Google Weather API.

---

## Architecture

A **monorepo** with separate `backend/` and `frontend/` packages. The frontend is built via Webpack and the output bundle is placed into the backend's `public/` directory, so the Express server both handles API requests and serves the React SPA from a single process.

```
weathersen/
├── backend/          # Express + TypeScript API server
└── frontend/         # React + Redux SPA
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Backend framework | Express 5.1 |
| Backend language | TypeScript (compiled via tsc, run via ts-node in dev) |
| HTTP client (server-side) | axios |
| Frontend framework | React 19 + React Router 7 |
| State management | Redux Toolkit 2 (slices + async thunks) |
| UI components | Material-UI (MUI) 7 with Emotion |
| Date handling | dayjs |
| Drag-and-drop | @hello-pangea/dnd |
| Maps & places | @react-google-maps/api |
| Bundler | Webpack 5 + ts-loader |

---

## Directory Structure

```
backend/
├── src/
│   ├── server.ts                 # App entry point, Express setup
│   ├── version.ts                # Server version constant
│   ├── routes/routes.ts          # API route definitions
│   ├── controllers/app.ts        # Request handlers
│   ├── utilities/googleWeather.ts# Google Weather API client
│   └── types/googleInterfaces.ts # TypeScript interfaces for Google API responses
├── public/build/                 # Frontend bundle output (generated)
├── .env                          # GOOGLE_MAPS_API_KEY
└── tsconfig.json

frontend/
├── src/
│   ├── index.tsx                 # Entry point (Redux, Router, GoogleMapsProvider)
│   ├── components/
│   │   ├── AppShell.tsx          # Top-level layout (AppBar + ItineraryInput)
│   │   ├── ItineraryInput.tsx    # Core itinerary UI (add/remove/reorder stops)
│   │   ├── LocationAutocomplete.tsx # Google Places autocomplete widget
│   │   ├── Forecast.tsx          # Per-stop weather summary row
│   │   ├── ForecastDetails.tsx   # Expanded forecast detail (placeholder)
│   │   ├── StartDateField.tsx    # Trip start date picker
│   │   └── GoogleMapsProvider.tsx# Loads Google Maps SDK
│   ├── redux/
│   │   ├── store.ts              # Redux store configuration
│   │   └── itinerarySlice.ts     # State slice + async thunks
│   ├── types/
│   │   ├── entities.ts           # Itinerary, ItineraryStop, Location, response types
│   │   ├── googleInterfaces.ts   # DailyForecastDay, ForecastDayPart, WeatherConditionType enum
│   │   └── base.ts               # getServerUrl(), API URL fragment constants
│   └── utilities/
│       ├── temperature.ts        # Celsius → Fahrenheit conversion
│       ├── utilities.ts          # toISODate() date formatter
│       ├── loadEnvConfig.ts      # Fetches /env-config.json from backend at startup
│       └── diagnostics.ts        # Suppresses specific React dev warnings
└── webpack.config.js             # Bundles frontend → ../backend/public/build/bundle.js
```

---

## API Endpoints

All forecast endpoints live under `/api/v1`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/healthz` | Health check → `{ ok: true }` |
| `GET` | `/env-config.json` | Dynamic config → `{ BACKEND_URL, GOOGLE_MAPS_API_KEY }` |
| `GET` | `/api/v1/version` | Server version → `{ serverVersion }` |
| `GET` | `/api/v1/forecast` | Single-stop forecast. Query: `location` (JSON `{lat,lng}`), `date` (ISO). Returns `{ days: DailyForecastDay[] }` |
| `GET` | `/api/v1/allForecasts` | All stops at once. Query: `locations` (JSON array), `date`, `numberOfDays`. Returns `{ forecastsForItineraryStops: DailyForecastDay[][] }` |

All other routes serve the React SPA (`index.html`) for client-side routing.

---

## Key Components

### `ItineraryInput.tsx`
The central UI component. Renders a table of itinerary stops with:
- A drag handle (via @hello-pangea/dnd) for reordering
- A "Day N" label computed from the stop's position and the trip start date
- A `LocationAutocomplete` input for place selection
- A date label showing the stop's date
- A `Forecast` row showing weather data for that stop/date
- A delete button per row
- Add stop / Clear trip controls

Column widths are fixed (drag: 24px, day: 64px, date: 120px) with the location column filling remaining space.

### `LocationAutocomplete.tsx`
Wraps the Google Places Autocomplete API. Uses session tokens to group requests for quota efficiency. Caches predictions by `place_id`. Returns a `Location` object containing `googlePlaceId`, `name`, and `geometry.location` (`{ lat, lng }`).

### `Forecast.tsx`
Displays a compact single-line weather summary for one stop:
- High / low temperatures (converted from Celsius to Fahrenheit)
- Weather condition with icon (Google icon URI when available, MUI fallback icon otherwise)
- Precipitation probability (%)
- Wind speed (converted from kph to mph)
- An expand toggle to show `ForecastDetails`

### Redux — `itinerarySlice.ts`

**State shape:**
```typescript
{
  itinerary: {
    itineraryStart: string;        // ISO date "YYYY-MM-DD"
    itineraryStops: ItineraryStop[];
  }
}
```

**Reducers:**
- `setItineraryStartDate` — updates the trip start date
- `setItineraryStops` — replaces the entire stops array
- `clearItinerary` — resets to one blank placeholder stop

**Async thunks:**
- `fetchForecast(stop, index)` — fetches weather for a single stop, matches the returned `DailyForecastDay` to the stop's date, stores it in `itineraryStops[index].forecast`
- `fetchAllForecasts({ date, locations, numberOfDays })` — fetches weather for all stops in one request; each stop's forecasts are matched by `displayDate`

---

## Data Flow

```
1. User selects a start date
   → dispatch setItineraryStartDate
   → stop dates recalculate (stop N is startDate + N days)

2. User types a location
   → LocationAutocomplete queries Google Places API
   → Returns Location { lat, lng, googlePlaceId, name }
   → dispatch fetchForecast(stop, index)

3. fetchForecast thunk
   → GET /api/v1/forecast?location=...&date=...
   → Backend: controllers/app.ts → utilities/googleWeather.ts
   → Google Weather API (weather.googleapis.com)
   → Returns DailyForecastDay[]
   → Redux matches forecast to stop by displayDate
   → Forecast component re-renders

4. User changes start date
   → dispatch fetchAllForecasts (all stops refreshed in one round-trip)
   → Backend calls getDailyForecast() for each location in parallel
   → Redux matches each stop's forecasts by displayDate
```

---

## External Integrations

| Service | Usage |
|---|---|
| **Google Places Autocomplete API** | Location search in `LocationAutocomplete.tsx` (client-side) |
| **Google Weather API** (`weather.googleapis.com/v1/forecast/days:lookup`) | Daily forecast retrieval in `googleWeather.ts` (server-side) |
| **Google Maps SDK** | Loaded via `GoogleMapsProvider.tsx`; required for Places Autocomplete |

The API key is shared for all three: provided to the frontend at runtime via `/env-config.json` and read server-side from `.env`.

---

## Data Models (No Database)

All state is ephemeral — held in Redux, no persistent store.

**`ItineraryStop`**
```typescript
{
  id: string;              // UUID
  placeName?: string;      // Display name from Places API
  location?: {
    googlePlaceId: string;
    name: string;
    geometry: { location: { lat: number; lng: number } };
  };
  forecast?: DailyForecastDay;
}
```

**`DailyForecastDay`** (from Google Weather API)
```typescript
{
  displayDate: { year, month, day };
  maxTemperature: { degrees: number; unit: "C" };
  minTemperature: { degrees: number; unit: "C" };
  daytimeForecast?: ForecastDayPart;
  nighttimeForecast?: ForecastDayPart;
  sunEvents?: { sunrise, sunset };
  moonEvents?: { moonPhase, moonriseTimes, moonsetTimes };
}
```

**`ForecastDayPart`**
```typescript
{
  weatherCondition?: { iconBaseUri, description, type: WeatherConditionType };
  precipitation?: { probability?: { percent: number } };
  wind?: { speed: { value: number; unit: string } };
  relativeHumidity?: number;
  uvIndex?: number;
  cloudCover?: number;
  thunderstormProbability?: number;
}
```

`WeatherConditionType` is a large enum covering ~50 conditions (CLEAR, RAIN, SNOW, THUNDERSTORM, FOG, etc.).

---

## Configuration

| File | Purpose |
|---|---|
| `backend/.env` | `GOOGLE_MAPS_API_KEY` for server-side Google API calls |
| `backend/tsconfig.json` | Compiles `src/` → `dist/`, target ES2020, module commonjs |
| `frontend/tsconfig.json` | Strict mode, JSX react-jsx, target ES2015 |
| `frontend/webpack.config.js` | Bundles frontend → `../backend/public/build/bundle.js` |

---

## Current State & Known Gaps

- **`ForecastDetails.tsx`** — Returns a placeholder string. Intended to show UV index, humidity, sunrise/sunset, and hourly detail.
- **Filter & Refresh buttons** in the AppBar are rendered but not yet wired to any actions.
- No authentication, user accounts, or persistence — the itinerary lives only in the browser session.
