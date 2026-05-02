# test-cloudinary-api

English | [Español](README.es.md)

## Overview

This repository is a **small NestJS API** used to **try out and document** integration with [**nestjs-cloudinary-community**](https://www.npmjs.com/package/nestjs-cloudinary-community) — a Nest-friendly layer around Cloudinary uploads, replacements, and deletes — together with **PostgreSQL** (TypeORM), **Swagger**, and basic **CI hooks** (Husky, lint-staged, Commitlint).

It is intentionally scoped as a **sandbox / proof-of-concept**, not a production product.

## Features

- REST **image** module: upload (single / many), list, get by id, update (replace in Cloudinary + DB), delete (single, bulk, by folder path segment).
- **TypeORM** + Postgres (`compose.yml` for local DB).
- **Swagger UI** at `/swagger` when `NODE_ENV=development` (see `src/main.ts`).
- **Unit tests** (`*.spec.ts`) and **HTTP e2e-style tests** under `test/` (mocked `ImageService`, no real Cloudinary/DB in e2e).
- **Husky**: pre-commit runs lint-staged (ESLint, Prettier, related Jest); **commitlint** enforces [Conventional Commits](https://www.conventionalcommits.org/) with a **required scope** (see `commitlint.config.js`).

## Prerequisites

- Node.js 20+ (or current LTS you use for Nest 11).
- npm.
- Docker (optional) for Postgres via `docker compose up -d`.

## Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

   Fill in **Cloudinary** and **database** values. If Postgres runs in Docker, align credentials with `compose.yml` (first run may need a fresh volume if passwords changed — see compose docs / `docker compose down -v`).

3. Start the database (optional):

   ```bash
   docker compose up -d
   ```

4. Run the API:

   ```bash
   npm run start:dev
   ```

   Default URL: `http://localhost:3000` (or `PORT` from `.env`).

## Scripts

| Command              | Description              |
| -------------------- | ------------------------ |
| `npm run start:dev`  | Nest in watch mode       |
| `npm run build`      | Production build         |
| `npm run start:prod` | Run compiled `dist/main` |
| `npm run lint`       | ESLint on `src` / `test` |
| `npm run format`     | Prettier write           |
| `npm test`           | Unit tests (Jest)        |
| `npm run test:e2e`   | E2e Jest suite           |

## API quick reference

- Base path: `/image` (see `ImageController`).
- **Swagger**: `http://localhost:<PORT>/swagger` when `NODE_ENV=development`.

## Commit history (Conventional Commits)

Recent history (oldest → newest):

| Hash      | Message                                                                |
| --------- | ---------------------------------------------------------------------- |
| `960f385` | `chore(deps): add nestjs project dependencies and tooling configs`     |
| `94a65b5` | `feat(app): add nest bootstrap with typeorm postgres and cloudinary`   |
| `9ee5b2a` | `feat(image): add image module with cloudinary upload and persistence` |
| `8dad489` | `test(tests): add unit specs and http e2e harness for image routes`    |
| `4a2d69b` | `chore(ci): add husky hooks lint-staged and commitlint`                |

Commit messages follow **type(scope): subject**; allowed scopes are defined in `commitlint.config.js` (e.g. `image`, `app`, `ci`, `tests`, `deps`, …).

## License

MIT — see `package.json` (`"license": "MIT"`).
