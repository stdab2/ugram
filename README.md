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

# UGRAM - Quick Start (Docker Compose)

This project includes:

- web: Vite/React
- api: Node/GraphQL
- db: Postgres

**Quick start (for grading)**

1. Install and run Docker Desktop (includes Docker Compose v2).
2. From the repo root, run:

```bash
docker compose up --build
```

3. Open the app: http://localhost:5173

**Useful endpoints**

- Web: http://localhost:5173
- GraphQL API: http://localhost:4001/graphql
- DB: localhost:5432

**Demo walkthrough**
Starting from the main page (http://localhost:5173), you can see a list of posts from all users, ordered by date.

Then, you can navigate to the search page (http://localhost:5173/search) to see the list of users, then you can view a user's profile (http://localhost:5173/profile/:username) by clicking on them.

After that, you can navigate to the create post page (http://localhost:5173/create) and upload an image you want to post. You can also add a description to your post, add tags directly from the description (e.g. \#nature) and also tag other users also from the description (e.g. \@jane_smith).

After creating your post, you can navigate to your own profile page (http://localhost:5173/profile/me) and view your own posts. You can click on a post to view it's description and tags. You can also choose to either edit or delete a post that you made by clicking on the three dots at the top right of that view.

Finally, you can navigate to the settings page to access and update your profile's informations.

**Stop**

```bash
docker compose down
```

**Full reset (optional)**

```bash
docker compose down -v
```
