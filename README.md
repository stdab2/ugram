# UGRAM - Quick Start

This project includes:

- web: Vite/React
- api: Node/GraphQL
- db: Postgres

## Local Development (Docker Compose)

1. Install and run Docker Desktop (includes Docker Compose v2).
2. Create the local environment files used by the repo.
3. If you run the app with Docker Compose, make sure the root `.env` file exists beside `docker-compose.yml`.
4. From the repo root, run:

```bash
docker compose up --build
```

5. Open the app: http://localhost:5173

### Useful Local Endpoints

- Web: http://localhost:5173
- GraphQL API: http://localhost:4001/graphql
- DB: localhost:5432

### API Documentation

UGRAM provides two documentation modes:

1. Local interactive docs for development:

- http://localhost:4001/graphql

2. Public read-only docs for production:

- https://glo3112-classrooms.github.io/ugram-h2026-team-17/

How docs are generated locally:

```bash
pnpm docs:api
```

This command builds a static docs site from `apps/api/src/schema/*.graphql` and writes it to `docs/api/index.html`.

Production behavior:

- The production `/graphql` endpoint does not expose an interactive query UI.
- Documentation is published as a static GitHub Pages site from `main` only.

## Production

- Web application: https://d206wqa79jnx1m.cloudfront.net

## Local Environment Files

This repo currently uses three local environment files:

- Root `.env`: values consumed by `docker-compose.yml`, especially AWS/S3 and shared frontend media configuration.
- `apps/api/.env`: values consumed when running the API directly outside Docker.
- `apps/web/.env.local`: values consumed by the Vite frontend in local development.

All of these files are ignored by git.

### Root `.env`

Used by Docker Compose for S3-related configuration and media URL setup:

```dotenv
# AWS S3 / CloudFront Configuration
AWS_REGION="ca-central-1"
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
S3_BUCKET="ugram-media-s3"

# CloudFront media base URL (no trailing slash)
VITE_MEDIA_BASE_URL="https://d206wqa79jnx1m.cloudfront.net"
```

### API: `apps/api/.env`

Used for local API development:

```dotenv
# Database connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ugram"

# API Configuration
PORT=4000
NODE_ENV=development

# Google OAuth
CLIENT_ID="..."
CLIENT_SECRET="..."
GOOGLE_REDIRECT_URI="http://localhost:4001/oauth2/callback/google"
GOOGLE_CLIENT_ID="..."

# JWT
JWT_SECRET="..."

ENV='dev'
FRONTEND_ORIGIN="http://localhost:5173"
```

Note: the API code reads both `CLIENT_ID` and `GOOGLE_CLIENT_ID`, so keep them aligned.

### Frontend: `apps/web/.env.local`

Used for local web development:

```dotenv
# Sentry DSN - Get yours at https://sentry.io
VITE_SENTRY_DSN=

# Sentry release version (e.g., "1.0.0", git tag, or commit hash)
# Used to track deployments in Sentry. Should be set in CI/CD pipeline.
# Falls back to "dev" if not set.
VITE_APP_VERSION=

# Google Analytics 4 measurement ID (format: G-XXXXXXXXXX)
VITE_GA_MEASUREMENT_ID=

# GraphQL URL
VITE_GRAPHQL_URL="http://localhost:4001/graphql"

# S3 / CloudFront media base URL (no trailing slash)
VITE_MEDIA_BASE_URL=

# API base URL
VITE_API_BASE_URL="http://localhost:4001"
```

`VITE_APP_VERSION` is optional in local development and falls back to `dev` if not set.

If you already have these files locally, you do not need to request the values again unless they change.

**Demo walkthrough**
Start by creating an account from the sign-up page (http://localhost:5173/signup), or sign in from the login page (http://localhost:5173/login). Standard email/password authentication is available, and Google OAuth is also supported for sign-up and sign-in.

Once authenticated, you arrive on the main feed (http://localhost:5173), which displays posts from all users ordered by date.

From there, you can open the search page (http://localhost:5173/search). The search experience is one of the stronger parts of the app: it lets you explore users, posts, and hashtags from a single place, and you can narrow the results by type. You can run broad searches across all content, search for specific users, look up posts by text in their descriptions, or search hashtags directly. Hashtag search is especially useful because it also surfaces related posts and hashtag result counts.

You can then navigate to the create post page (http://localhost:5173/create) and upload an image. When writing the description, you can add hashtags directly in the text, for example \#nature, and mention other users with \@username.

After publishing, you can visit your own profile page (http://localhost:5173/profile/me) to view your posts, open a post to see its full description and tags, and edit or delete it from the post actions menu. You can also navigate to other users' profiles from the feed or from search results.

In the settings page (http://localhost:5173/settings), you can edit your profile information. You can also delete your account there if needed.

Finally, you can log out from the navigation menu.

**Stop**

```bash
docker compose down
```

**Full reset (optional)**

```bash
docker compose down -v
```

# Design (Architecture & Technologies)

This document describes the target architecture and the main technologies we plan to use for development and deployment.
Goal: keep the stack **simple, standard, and course-aligned**, while leaving room for optional improvements.

---

## High-Level Architecture

**Core components**

- **Web Client (SPA)**: React app running in the browser
- **API**: Node.js (TypeScript) server exposing a **GraphQL** API
- **Database**: PostgreSQL for relational data (users, images, comments, reactions, etc.)
- **Image Storage**: S3 for original uploads and resized variants
- **Infrastructure/Deployment**: Docker + AWS
- **Observability**: CloudWatch + optional Sentry/Datadog

**Typical request flow**

1. The React client calls the GraphQL API
2. The API reads/writes data in PostgreSQL
3. Images are uploaded to S3 (direct upload via presigned URLs or via the API)
4. Image variants are generated and served back to the client via URLs

---

## Frontend (Web Client)

### Main stack

- **React + TypeScript** — UI framework and type safety
- **Vite** — fast dev server + build tool
- **shadcn/ui + TailwindCSS** — UI components + styling
- **React Router** — client-side routing (`/search`, `/profile/:username`, etc.)

### Data fetching & types

- **Apollo Client** — server-state caching, retries, invalidation
- **GraphQL Code Generator** — generates TypeScript types from the schema and operations (queries/mutations)

### Local UI state & forms

- **Zustand** — lightweight client/UI state (modals, toasts, small preferences)
- **React Hook Form + Zod** — forms + runtime validation

---

## Backend (API)

### Runtime & HTTP server

- **Node.js + TypeScript** — runtime + language
- **Express.js** — HTTP server framework

### GraphQL API

- **Endpoint**: `/graphql`
- **Operations**: profiles, users, images (CRUD), feed, search, comments/reactions/notifications (later deliverables)

### Data layer

- **PostgreSQL**
- **Prisma** — ORM + migrations
  - **ORM**: TypeScript-based DB access
  - **Migrations**: versioned schema changes (tables, columns, indexes)

### Auth (Deliverable 2)

- **OAuth (Google/Facebook) + JWT**

### Logging & validation

- **pino** — structured logging
- **Zod** — input validation

---

## CI/CD

### CI (Continuous Integration)

**Tool: GitHub Actions** (runs on `pull_request` and pushes to `main`)

- Install dependencies
- Lint
- Tests
- Build (frontend + backend)
- (Optional) Docker build validation

### CD (Continuous Deployment)

**Tool: GitHub Actions** (runs on merge to `main`)

- Build and deploy backend to **Elastic Beanstalk**
- Deploy frontend as a static site to **S3**
- Run DB migrations during deployment (`prisma migrate deploy`)

---

## Deployment

### Deliverable 1 (Dev / early deployment)

- **Local dev**: Docker Compose (web + api + postgres)
- **Images**: local storage (dev) or S3 (if configured)

### Deliverable 2+ (AWS target)

- **Compute**: Elastic Beanstalk (Docker/Node)
- **Database**: RDS (PostgreSQL)
- **Images**: S3
- **Monitoring**: CloudWatch
- **Infrastructure as Code (optional)**: CloudFormation or Terraform

---

## Testing Strategy

### Frontend

- **Vitest + Testing Library** — component tests and UI interactions

### Backend

- **Unit tests** — services/utilities (business logic)
- **Resolver tests** — GraphQL resolvers (with mocks when appropriate)
- **Integration tests** — API + Postgres for key flows (Docker-based test DB)

---

## Quality, Security & Performance Tooling

### Security (automated)

- **CodeQL** — static analysis security scanning in CI
- **Dependabot** — dependency update PRs + vulnerability alerts

### Security (dynamic)

- **OWASP ZAP** — DAST scan against a running staging environment

### API protections

- **graphql-depth-limit** — limits GraphQL query depth
- **express-rate-limit** — request rate limiting

### Performance testing

- **k6** — load testing

### Code quality & consistency

- **ESLint + Prettier**
- **Husky + lint-staged** (optional)
- **Commitlint** — Conventional Commits enforcement

### Monitoring and Observability

#### CloudWatch

We configured **Amazon CloudWatch** to centralize server logs and monitor the overall state of the application in production.

##### Server Logs
Logs from the **Elastic Beanstalk** environment are streamed to **CloudWatch Logs**.  
This allows us to directly inspect:

- application logs (`web.stdout.log`)
- HTTP access logs (`nginx/access.log`)
- error logs (`nginx/error.log`, `httpd/error_log`)

This gives us better visibility into:
- requests received by the server
- application errors
- the backend’s overall behavior in production

> Example: we were able to confirm that requests to `/login`, `/oauth2/google`, and `/graphql` were properly logged in CloudWatch.

##### CloudWatch Dashboard
A dashboard named `ugram-prod` was also set up to track several important metrics:

- **Requests**: number of requests going through CloudFront
- **4xxErrorRate**: client error rate
- **5xxErrorRate**: server error rate
- **EnvironmentHealth**: overall health status of the Elastic Beanstalk environment

This dashboard allows us to quickly see:
- whether the application is receiving traffic
- whether HTTP errors are occurring
- whether the backend environment remains healthy

https://ulavaldti-my.sharepoint.com/:i:/g/personal/jagro26_ulaval_ca/IQCEjiZSSkd3TZ8nAtPwqQ5zASHx4srwpehpoKFszO8tC0Q?e=hYPeh1

#### WAF (Web Application Firewall)

We enabled **AWS WAF** protection at the **CloudFront** level.

##### Implemented Protection
- **Rate limiting** enabled
- threshold set to **300 requests per IP over 5 minutes**

This protection makes it easier to detect and limit:
- automated scans
- bursts of abnormal requests
- certain suspicious or abusive behaviors

The WAF therefore adds an initial layer of security in front of the frontend and the routes exposed through CloudFront.

---

## Application Analytics

### Google Analytics

We integrated **Google Analytics 4 (GA4)** into the application in order to produce analytics on user behavior.

The goal is to better understand:
- the pages visited
- the main interactions
- the user journey within the application

#### Examples of Tracked Events
Depending on the implementation, the analytics may include:

- page view (`page_view`)
- sign up (`sign_up`)
- login (`login`)
- post creation (`create_post`)

[Analytics screenshot 1](https://ulavaldti-my.sharepoint.com/:i:/g/personal/jagro26_ulaval_ca/IQBHm1Lk8mKvTbEdCxE-s38tATO0Pfvn6h52hYuxIoOM5t8?e=jH0Aio)

[Analytics screenshot 2](https://ulavaldti-my.sharepoint.com/:i:/g/personal/jagro26_ulaval_ca/IQDMT6XSPFu4T7U5UL2B0MdbAe-CmQnbr8sKsvR4Cqariu8?e=MByYvP)

[Analytics screenshot 3](https://ulavaldti-my.sharepoint.com/:i:/g/personal/jagro26_ulaval_ca/IQAHbPZ4tGNBS7lZvN0hJwXCAeU2Bmc0SWH1nfGfMKu-fdI?e=bmhOkq)

---

## Git Workflow & Commit Conventions

### Workflow (Git Flow–inspired)

- `main`: stable / deployable (production)
- `develop`: integration branch (latest combined work before release)
- `feature/*`: feature branches (branched from `develop`, merged back into `develop`)
- `fix/*`: bugfix branches (branched from `develop`, merged back into `develop`)
- `chore/*`: other branches (branched from `develop`, merged back into `develop`)
- Pull requests required to merge into `develop` (and `main` for releases)

### Conventional Commits (examples)

- `feat(auth): add Google OAuth login`
- `feat(images): add image upload metadata mutation`
- `fix(feed): correct sorting by createdAt`
- `chore(ci): add CodeQL workflow`
- `docs(readme): update architecture section`

---

## Monorepo Structure (Proposed)

```
.
├─ apps/
│ ├─ web/ # React + Vite
│ └─ api/ # Node + TS (Express + GraphQL)
├─ package.json # packages
├─ docker-compose.yml # local dev stack
├─ .github/workflows/ # CI/CD pipelines
└─ README.md
```

## Notes

- Exact infrastructure details may evolve as the course progresses.
