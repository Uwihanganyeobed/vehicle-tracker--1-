## Vehicle Tracker — Setup and Test Guide

This project tracks vehicles in real-time. You can stream live GPS from a phone to the server and watch the map update.

### Prerequisites
- Node.js 18+
- npm or pnpm or yarn
- Local MongoDB instance (MongoDB Community Server) or MongoDB Atlas
- Local network access from your phone to your dev machine (same Wi‑Fi)

### Install & Run
```bash
npm install
npm run dev
```
App runs at `http://localhost:3000`.

### MongoDB Setup
Use a local MongoDB server or MongoDB Atlas.

1) Create `.env.local` in the project root with:
```
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=vehicle-tracker
TRACK_TOKEN=your-secret   # optional but recommended
```
2) Restart `npm run dev` after setting env vars.

### Environment (optional but recommended)
- Security token for location updates:
  - Add `TRACK_TOKEN=your-secret` to `.env.local` at project root.
  - Restart the dev server after changes.

### Core Pages to Navigate
- Dashboard (map + stats): `/`
- Vehicle Management (CRUD): `/vehicles`
- Analytics (from live data): `/analytics`
- Phone Tracker (send GPS from device): `/tracker`

### How Real Tracking Works
1) Create or choose a vehicle ID (e.g., `VH001`) on `/vehicles`.
2) Open `/tracker` on your phone and allow location permission.
3) Enter the same Vehicle ID and (if set) your `TRACK_TOKEN`.
4) Tap Start — the phone will send GPS to the server in the background.
5) On the dashboard `/`, watch the marker move; use Vehicle List → “Track on Map” to center.

### Open the Tracker on Your Phone
- Find your computer’s local IP (Windows PowerShell):
  ```powershell
  ipconfig | findstr IPv4
  ```
- On your phone’s browser, open: `http://<your-computer-ip>:3000/tracker`
  - Example: `http://192.168.1.50:3000/tracker`

### Location Update API
- Endpoint: `PUT /api/vehicles/[id]/location`
- Headers: `Content-Type: application/json`, and `Authorization: Bearer <TRACK_TOKEN>` (if `TRACK_TOKEN` is set)
- Body:
  ```json
  { "lat": 40.7128, "lng": -74.0060, "speed": 5, "heading": 90 }
  ```

Example cURL:
```bash
curl -X PUT "http://localhost:3000/api/vehicles/VH001/location" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"lat":40.7128,"lng":-74.0060,"speed":10,"heading":45}'
```

### Other Useful Endpoints
- List vehicles: `GET /api/vehicles`
- Vehicle detail: `GET /api/vehicles/[id]`
- Create vehicle: `POST /api/vehicles`
- Update vehicle: `PUT /api/vehicles/[id]`
- Delete vehicle: `DELETE /api/vehicles/[id]`
- Live tracking snapshot: `GET /api/vehicles/tracking`
- Analytics from live store: `GET /api/analytics`

### Notes & Limitations
- The app uses an in-memory store (`lib/store.ts`). Data resets on server restart. For production, use a database or Redis.
- Use HTTPS in production to ensure stable geolocation on mobile browsers.
- Only track devices with explicit legal consent.

### Troubleshooting
- Cannot open from phone: ensure both devices are on the same Wi‑Fi; use IP instead of localhost; check firewall.
- Tracker says Unauthorized: set `TRACK_TOKEN` and include the bearer token on `/tracker` or disable the env var for testing.
- Marker not moving: confirm `/tracker` shows recent update time; check browser location permissions; verify `/api/vehicles/tracking` returns updated coordinates.


