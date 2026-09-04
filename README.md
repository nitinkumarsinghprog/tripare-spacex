# Tripare SpaceX Launch Explorer

React Native / Expo assessment project for exploring SpaceX launches.

## Features

-   SpaceX launch list
-   Mission-name search with debounce
-   Upcoming / successful / failed status filters
-   Rocket and launchpad filters
-   Date presets and sorting
-   Launch details
-   Launchpad details with local caching
-   SQLite persistence
-   Offline cached-data support
-   Local bookmarks with optional notes
-   Dedicated Bookmarks screen
-   Pull-to-refresh
-   React Query server/cache state
-   Zustand UI state
-   Zod API validation
-   TypeScript strict mode

## Architecture

``` text
SpaceX API
    ↓
API Client
    ↓
Zod Validation
    ↓
Sync Service
    ↓
SQLite Cache
    ↓
React Query
    ↓
React Native Screens
```

``` text
src/
├── api/
├── database/
├── features/
│   ├── launches/
│   └── bookmarks/
├── hooks/
├── navigation/
├── services/
└── store/
```

## Main Screens

### Launches

Displays SpaceX launches using a performant `FlatList`. Supports search,
filtering, sorting, refresh, cached data and an offline indicator.

### Launch Details

Shows mission information, status, date, rocket, launchpad, mission
details, media and external links.

### Bookmarks

Bookmarks are stored locally in SQLite. Users can save/remove launches
and maintain optional notes.

## Local Database

Database: `tripare.db`

Tables:

-   `launches` --- cached launches
-   `launchpads` --- cached launchpad data
-   `bookmarks` --- locally saved launches and notes

## API

Base API:

``` text
https://api.spacexdata.com
```

Relevant endpoints:

``` text
GET /v4/launches
GET /v4/launchpads/:id
```

API responses are validated with Zod schemas.

## Testing

Run TypeScript validation:

``` bash
npx tsc --noEmit
```

Run tests:

``` bash
npm test
```

Current result:

``` text
1 test suite passed
15 tests passed
```

The test suite covers launch search, status/rocket/launchpad filtering,
date/name sorting, combined filters and array immutability.

## Run

``` bash
npm install
npm start
```

Available scripts:

``` text
npm start
npm run android
npm run ios
npm run web
npm test
```

## Performance

The launch list uses `FlatList` rendering optimizations and debounced
search. React Query controls cache lifetimes and avoids unnecessary
refetching.

## Offline Strategy

Cached launch and launchpad data is persisted in SQLite. The application
can display cached launch data when offline, while synchronization
updates the local cache when network access is available.

## Submission Checklist

-   [x] TypeScript strict mode
-   [x] SpaceX API integration
-   [x] Zod validation
-   [x] Launch list
-   [x] Search
-   [x] Filters
-   [x] Sorting
-   [x] Launch details
-   [x] Launchpad caching
-   [x] SQLite persistence
-   [x] Offline handling
-   [x] Bookmarks
-   [x] React Navigation
-   [x] React Query
-   [x] Zustand
-   [x] Jest
-   [x] 15 passing tests

## Project

Tripare SpaceX Assessment Project
