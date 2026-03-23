# Backend (Nest.js + Prisma + SQLite)

## Spuštění

```bash
cd backend
npm install
npx prisma migrate dev
npm run seed
npm run start:dev
```

`npm run start:dev` automaticky spouští také:
- `prisma migrate deploy`
- `prisma generate`

Díky tomu se opraví i situace, kdy lokální DB ještě nemá poslední sloupce z migrací (např. `ownerKey`).

Server poběží na `http://localhost:3001`.

## Endpoints

- `GET /campaigns`
- `GET /campaigns/:id`
- `POST /campaigns`
- `PATCH /campaigns/:id`
- `POST /campaigns/:id/submit`


## TESTING

## FE
## cd frontend/talent-web-app
## npm i
## npm run dev
## http://localhost:3000/

## BE - DB
## npx prisma studio
## http://localhost:5555

## BE
## cd backend
## npm i
## npx prisma migrate dev
## npm run seed
## npm run start:dev