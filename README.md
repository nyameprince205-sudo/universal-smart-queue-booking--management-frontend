# Universal Smart Queue & Booking Management System — Web Client

The React web client for a multi-tenant queue and booking platform. Serves four distinct audiences from one application: customers, branch staff, business owners, and the platform operator.

The REST API and real-time server live in a [separate repository](https://github.com/nyameprince205-sudo/universal-smart-queue-booking-management).

---

## Interfaces

### Public / customer

Search for a business, view its services, and book — with or without an account. Guests can book and track a queue position using a link sent to them at check-in, no sign-up required.

Signed-in customers additionally get a booking history, live status updates, and a support channel to any business they've used.

### Staff console

Built around what a staff member actually does at a counter. Bookings awaiting arrival are listed with the customer's name, phone, service and time — one click checks them in, no lookup step. Phone lookup stays available for genuine walk-ins but is collapsed by default rather than being the primary path.

The live board shows waiting, called and serving tickets, updating in real time as colleagues at other counters work.

### Org Admin dashboard

Branches, services, staff, counters and customers. Live operational metrics, historical analytics with date-range filtering, exportable reports, subscription management, and a support inbox for tickets raised by customers and staff — with the ability to escalate to the platform operator.

### Super Admin platform dashboard

Organizations, registration requests (approving one provisions the business and its first admin account automatically), Org Admin account management, contact messages, and escalated support tickets.

---

## Design

The visual language is built around the product itself rather than a generic dashboard template — a deep forest green paired with a warm gold accent on an off-white background, with a ticket-stub motif (notched edges, dark ink, gold numerals) used for queue numbers and status badges to echo the physical paper ticket the whole product replaces.

Fraunces carries headings and ticket numerals where character matters; Sora carries body text and dense admin screens where legibility matters more.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Build | Vite |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| Routing | React Router |
| HTTP | Axios |
| Real-time | Socket.IO client |
| Charts | Recharts |
| Icons | Lucide |

---

## Architecture notes

**Auth context** — a single `AuthContext` tracks both identity types (staff/admin and customer) with separate token storage, since a device may legitimately hold both. `ProtectedRoute` gates by both auth type and role.

**Real-time hooks** — `useCustomerBookingUpdates` subscribes a signed-in customer to their own booking events, so status changes appear without a refresh. The staff console subscribes to its branch's queue room.

**API layer** — one module per resource under `src/api/`, each wrapping a configured Axios client that handles token attachment and refresh-on-401 centrally, so no component deals with auth plumbing.

**Shared components** — `SupportThread` renders a full ticket conversation and is reused across all four support surfaces (customer, staff, org admin, super admin) with different permissions passed in, rather than four near-identical implementations.

---

## Running locally

### Prerequisites

- Node.js 18+
- The API server running (see the backend repository)

### Setup

```bash
git clone <this-repo>
cd frontend-new
npm install
```

Create a `.env` file:

```ini
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_SOCKET_URL=http://localhost:4000
```

Start the dev server:

```bash
npm run dev
```

Runs on `http://localhost:5173`. The API's `FRONTEND_URL` must match this origin or CORS will reject requests.

### Build

```bash
npm run build
```

---

## Project structure

```
src/
├── api/          one module per resource, over a shared Axios client
├── components/   shared UI (navbar, modals, support thread, stat cards)
├── context/      auth state for both identity types
├── hooks/        real-time subscriptions, document title
├── layouts/      admin shell with collapsible sidebar
├── pages/
│   ├── auth/     login, registration, password reset, verification
│   ├── customer/ home, search, booking, tracking, support
│   ├── staff/    queue console, customers, support
│   └── admin/    dashboards, management, analytics, platform
├── routes/       route definitions and role gating
└── utils/        formatting helpers
```
