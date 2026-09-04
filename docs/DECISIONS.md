# Decisions

- **Zustand:** small, typed UI/sync state with minimal render subscriptions.
- **SQLite:** indexed, queryable offline persistence suitable for 1,000+ launches; migrations use `PRAGMA user_version`.
- **React Query:** request deduplication and cache lifecycle; SQLite is returned first and network refreshes in the background.
- **Maps:** native `react-native-maps`, with foreground-only location permission. Denial retains the launchpad marker and hides user distance.
