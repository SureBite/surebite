# SureBite frontend

React 18 + Vite + Tailwind CSS frontend for SureBite, built to the Architecture & Engineering Specification v2.1.
"AllergyMenu" in the spec is the old product name; technical identifiers (routes, fields, database name) are unchanged.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 25 tests
npm run build
```

Mock mode is on by default (`VITE_USE_MOCK=true` in `.env`), so no backend is needed.
Demo sign-in: `ananya@saffrontable.in` / `saffron123`. Mock data lives in the browser's localStorage
(key `surebite_mock_db`); clear it to reset. A photo whose file name contains `fail` shows the extraction-failed screen.

## Structure

```
src/
├── App.jsx                 routes, ErrorBoundary, protected manager layout
├── main.jsx
├── index.css               Tailwind + print styles
├── api/api.js              single Axios client: api.auth / api.menus / api.diner
├── api/mockApi.js          same methods and response shapes, backed by localStorage   (not in spec)
├── context/AuthContext.jsx
├── hooks/useMenuFilter.js
├── utils/constants.js      ALLERGENS, DIETARY_TYPES, currencies, labels               (not in spec)
├── components/             Navbar, FilterBar, DishCard, ImageInspector
├── pages/                  Home, Auth, Dashboard, Upload, Verify, QrCode, DinerMenu
└── test/                   Vitest tests                                               (not in spec)
```

## Backend integration checklist

**Switching on the real backend:** set `VITE_USE_MOCK=false` and `VITE_API_URL=http://localhost:5000/api` in `.env`, then restart `npm run dev`. No component changes are needed.

**CORS:** allow `http://localhost:5173` (`CLIENT_URL`) with the `Authorization` header.

**Auth:** the JWT from login/register is stored in localStorage (`surebite_token`) and sent as `Authorization: Bearer <token>`. On page load the frontend calls `GET /auth/me`; any error signs the manager out.

**Errors:** the frontend shows `message` from a JSON error body: `{ "message": "..." }`.

| Call | Request the frontend sends | Response it expects |
|---|---|---|
| `POST /auth/register` | `{ name, email, password, restaurantName }` | `{ token, user }` |
| `POST /auth/login` | `{ email, password }` | `{ token, user }` |
| `GET /auth/me` | Bearer | `{ user }` |
| `GET /menus` | Bearer | `{ menus: [...] }` each with `items` |
| `POST /menus/upload` | Bearer, multipart: `image` (file), `name`, `currency` | `{ menu }` with `status: 'draft'` |
| `GET /menus/:id` | Bearer | `{ menu }` |
| `PUT /menus/:id` | Bearer, `{ name, currency, items: [...] }` (full item list) | `{ menu }` |
| `PATCH /menus/:id/publish` | Bearer, no body | `{ menu }` with `status: 'published'`, `slug` and `publishedAt` (ISO date; not in spec v2.1, the QR page falls back to `updatedAt`) |
| `GET /menus/:id/qr` | Bearer | `{ qrPng, qrSvg, publicUrl }` |
| `DELETE /menus/:id` | Bearer | `{ success: true }` |
| `GET /diner/:slug` | public | `{ menu }` |
| `POST /diner/:slug/scan` | public, `{}` | `{ success: true }` (failures are ignored) |

**Fields used**
- user: `name`, `email`, `restaurantName`, `restaurantSlug`
- menu: `_id`, `name`, `slug`, `imageUrl`, `status`, `currency`, `items`
- item: `_id`, `name`, `description`, `price`, `category`, `allergens`, `dietaryType`, `aiInferred`, `isVerified`

**Points the spec leaves open — please confirm**
1. Request bodies for register, upload and `PUT` (the table above is the frontend's proposal). The multipart file field is named `image`.
2. New dishes added by a manager are sent in `items` without an `_id`.
3. `qrPng` is used as an `<img src>` (data URL); `qrSvg` is SVG markup saved as a `.svg` file; `publicUrl` must be `<frontend origin>/m/<slug>`.
4. The diner menu shows `menu.restaurantName` as its title if the diner response includes it (falls back to `menu.name`).
5. `menu.updatedAt` / `createdAt` are shown as dates if present (Mongoose timestamps).
6. A failed extraction should return an error status, or a menu with `status: 'failed'`; both show the retry screen.
7. `PATCH publish` should reject a menu with unverified items; the frontend already disables the button.

## Safety rules enforced in the UI

- AI-inferred allergens are labelled "AI inferred" until a person verifies the dish.
- Editing a dish's name, ingredients, dietary type or allergens sets `isVerified` back to `false`.
- Publish is disabled until every dish is verified; a published menu's edits can only be saved fully verified.
- The diner menu always shows the cross-contact disclaimer and never says a dish is allergen-free.
