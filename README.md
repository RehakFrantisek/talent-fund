# talent-web-app

Monorepo pro crowdfunding platformu na podporu mladých talentů.

## Rychlý start (backend + frontend)

1) **Backend (Nest + Prisma + SQLite)**

```bash
cd backend
npm i
npx prisma migrate dev
npm run prisma:generate
npm run seed
npm run start:dev
```

Backend poběží na `http://localhost:3001`.

2) **Frontend (Next.js App Router)**

```bash
cd frontend/talent-web-app
npm i
npm run dev
```

Frontend poběží na `http://localhost:3000` a používá `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`).
> `npm run start:dev` teď automaticky provede `prisma migrate deploy` + `prisma generate`, takže se opraví i stav, kdy DB chybí nový sloupec (např. `ownerKey`).

