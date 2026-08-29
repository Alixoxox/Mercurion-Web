# Mercurion-Web

Angular frontend for **Mercurion**, an e-commerce web app with a customer storefront and an admin panel, built on top of a Spring Boot backend.

**Live demo:** [meezan-ecom.s3-website.ap-south-1.amazonaws.com](http://meezan-ecom.s3-website.ap-south-1.amazonaws.com/)

## Features

**Storefront**
- Browse products with search, category filters, and sorting
- Paginated product listing and detailed product pages with ratings/feedback
- Cart and checkout flow
- Order history for logged-in users
- Login / signup with JWT-based authentication

**Admin panel**
- Dashboard, product management (create/edit, bulk import), and order management
- Route guards restrict admin pages to users with the `ADMIN` role

**Core**
- JWT auth via an HTTP interceptor that attaches the bearer token, handles token expiry, and surfaces toast notifications on auth errors
- Route guards for authenticated and admin-only routes

## Tech Stack

- [Angular 16](https://angular.io/) (standalone components, lazy-loaded routes)
- TypeScript, RxJS
- [Tailwind CSS](https://tailwindcss.com/) + [Flowbite](https://flowbite.com/)
- [ngx-toastr](https://github.com/scttcper/ngx-toastr) for notifications
- [`@ngx-env/builder`](https://github.com/chihab/ngx-env) for environment variables at build time

## Getting Started

### Prerequisites
- Node.js and npm
- A running instance of the [Mercurion backend](#) (Spring Boot API)

### Setup

```bash
git clone https://github.com/Alixoxox/Mercurion-Web.git
cd Mercurion-Web
npm install
```

Create a `.env` file in the project root pointing at your backend API:

```
NG_APP_API_URL=http://localhost:8080
```

### Development server

```bash
npm start
```

Navigate to `http://localhost:4200/`. The app reloads automatically on source changes.

### Build

```bash
npm run build
```

Build artifacts are output to `dist/`.

### Tests

```bash
npm test
```

Runs unit tests via Karma.

## Project Structure

```
src/app/
├── core/            # services, HTTP interceptors, route guards
├── features/         # feature modules: auth, products, cart, checkout,
│                      # history, contact, about, admin
└── shared/           # shared components, models, form validators
```

## Deployment

Pushes to `main` trigger a GitHub Actions workflow that builds the app and syncs the output to an S3 bucket configured for static website hosting, pointing the build at the backend host via `NG_APP_API_URL`.
