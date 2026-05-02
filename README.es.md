# test-cloudinary-api

Documentación en español | [English](README.md)

## Resumen

Este repositorio es una **API NestJS pequeña** pensada como **prueba de integración** del paquete [**nestjs-cloudinary-community**](https://www.npmjs.com/package/nestjs-cloudinary-community) (capa Nest para subidas, reemplazos y borrados en **Cloudinary**), junto con **PostgreSQL** (TypeORM), **Swagger** y **hooks de calidad** (Husky, lint-staged, Commitlint).

Es un **entorno de prueba / PoC**, no un producto listo para producción.

## Funcionalidades

- Módulo REST de **imágenes**: subida (una / varias), listado, detalle por id, actualización (reemplazo en Cloudinary + base de datos), borrado (uno, varios ids, carpeta por segmento de ruta).
- **TypeORM** + Postgres (`compose.yml` para entorno local).
- **Swagger** en `/swagger` si `NODE_ENV=development` (ver `src/main.ts`).
- **Tests unitarios** (`*.spec.ts`) y pruebas **e2e HTTP** en `test/` (servicio mockeado; sin Cloudinary ni DB real en e2e).
- **Husky**: en `pre-commit` ejecuta lint-staged (ESLint, Prettier, Jest relacionado); **commitlint** exige [Conventional Commits](https://www.conventionalcommits.org/) con **scope obligatorio** (ver `commitlint.config.js`).

## Requisitos

- Node.js acorde a Nest 11 (p. ej. 20+ o LTS actual).
- npm.
- Docker (opcional) para Postgres con `docker compose up -d`.

## Puesta en marcha

1. Clonar e instalar:

   ```bash
   npm install
   ```

2. Variables de entorno:

   ```bash
   cp .env.example .env
   ```

   Completar **Cloudinary** y **base de datos**. Si Postgres va en Docker, las credenciales deben coincidir con `compose.yml` (si cambiaste contraseñas tras un arranque previo, puede hacer falta `docker compose down -v` para reinicializar el volumen).

3. Base de datos (opcional):

   ```bash
   docker compose up -d
   ```

4. Arrancar la API:

   ```bash
   npm run start:dev
   ```

   URL por defecto: `http://localhost:3000` (o el `PORT` de `.env`).

## Scripts

| Comando              | Descripción                   |
| -------------------- | ----------------------------- |
| `npm run start:dev`  | Nest en modo watch            |
| `npm run build`      | Build de producción           |
| `npm run start:prod` | Ejecuta `dist/main` compilado |
| `npm run lint`       | ESLint sobre `src` y `test`   |
| `npm run format`     | Prettier (escribe archivos)   |
| `npm test`           | Tests unitarios (Jest)        |
| `npm run test:e2e`   | Suite e2e Jest                |

## API rápida

- Prefijo: `/image` (ver `ImageController`).
- **Swagger**: `http://localhost:<PUERTO>/swagger` con `NODE_ENV=development`.

## Historial de commits (Conventional Commits)

Orden antiguo → reciente:

| Hash      | Mensaje                                                                |
| --------- | ---------------------------------------------------------------------- |
| `960f385` | `chore(deps): add nestjs project dependencies and tooling configs`     |
| `94a65b5` | `feat(app): add nest bootstrap with typeorm postgres and cloudinary`   |
| `9ee5b2a` | `feat(image): add image module with cloudinary upload and persistence` |
| `8dad489` | `test(tests): add unit specs and http e2e harness for image routes`    |
| `4a2d69b` | `chore(ci): add husky hooks lint-staged and commitlint`                |

Los mensajes siguen **tipo(ámbito): descripción**; los ámbitos permitidos están en `commitlint.config.js` (por ejemplo `image`, `app`, `ci`, `tests`, `deps`, …).

## Licencia

MIT — ver `package.json` (`"license": "MIT"`).
