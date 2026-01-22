# Design (Architecture & Technologies)

Cette section décrit l’architecture cible du projet et les technologies envisagées pour le développement et le déploiement.

---

## Architecture (vue d’ensemble)

- **Client Web (SPA)** : React
- **API** : Node.js (TypeScript) — GraphQL
- **Base de données** : PostgreSQL
- **Stockage d’images** : S3
- **Déploiement & infra** : Docker + AWS
- **Observabilité** : CloudWatch + Sentry / Datadog

---

## Frontend

- **Framework** : React + TypeScript
- **Build tool** : Vite
- **UI** : shadcn/ui + TailwindCSS
- **Routing** : React Router
- **Gestion des données (server state)** : TanStack Query
- **State UI (client state léger)** : Zustand
- **Formulaires & validation** : React Hook Form + Zod

---

## Backend

- **Runtime** : Node.js (TypeScript)
- **Server HTTP** : Express.js
- **API** : GraphQL
- **ORM & DB** : Prisma + PostgreSQL
- **Authentification** : OAuth (Google/Facebook) + JWT
- **Logging** : pino
- **Validation** : Zod

---

## CI/CD

- **CI** : GitHub Actions (Déclenché sur pull_request et push sur main)

  - Install
  - Lint
  - Tests
  - Build (frontend and backend)
  - Build image Docker

- **CD** : GitHub Actions (Déclenché à chaque merge sur main, déploiement automatique sur AWS)

  - Backend sur Elastic Beanstalk (ou EC2 Docker)
  - Frontend déployé sur S3 (site statique)
  - Migrations DB exécutées au déploiement (prisma migrate deploy)

---

## Déploiement

- **Compute** : Elastic Beanstalk ou EC2 (Docker)
- **DB** : RDS (PostgreSQL)
- **Images** : S3
- **Monitoring** : CloudWatch
- **Autres** : IaC via CloudFormation ou Terraform

---

## Qualité

- **Lint/format** : ESLint + Prettier
- **Tests** : Vitest + Testing Library (frontend) ; tests backend à déterminer
- **Hooks Git (optionnel)** : Husky + lint-staged
- **Conventions de commits** : Commitlint
