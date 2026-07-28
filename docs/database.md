# Database

Open Slalom uses the [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) to store data client-side in the Electron instance.

The database instance is created using [Dexie](https://dexie.org/). Data can be queried using [Dexie React Hooks](https://github.com/dexie/dexie-react-hooks).

Database related code can be found in the `renderer/lib/database` folder. The database entities are defined in the `renderer/lib/types` folder. The database is initialized in `renderer/lib/database/index.ts`.

## Architecture overview

Open Slalom separates database entities into two categories:

### Master data

Master data describes entities that exist independently from individual sessions.

Examples:

- Drivers
- Clubs
- Teams
- Karts
- Venues

These entities are reused across multiple sessions.

### Session data

Session data represents actual driving activities.

Examples:

- Practice sessions
- Competition sessions
- Driver participations
- Stints
- Laps
- Results
