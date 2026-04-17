[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/PzCCy7VV)

# Banking API Fundamental Arief Budi

REST API perbankan sederhana menggunakan `NestJS`, `Prisma`, `PostgreSQL`, `JWT`, dan `Swagger`.

Project ini memenuhi requirement fundamental berikut:


## Tech Stack

- `NestJS`
- `Prisma ORM`
- `PostgreSQL`
- `@prisma/adapter-pg` untuk koneksi Prisma 7 ke PostgreSQL
- `JWT` + `Passport`
- `Swagger`
- `Jest`

## Database Tooling

Untuk development lokal:
- `PostgreSQL` berperan sebagai database utama <img width="1910" height="982" alt="image" src="https://github.com/user-attachments/assets/be65daad-36c0-481d-be48-8b80b4eb0891" />

- `DBeaver` bisa dipakai sebagai GUI client untuk melihat table, relasi, dan data <img width="1897" height="971" alt="image" src="https://github.com/user-attachments/assets/d91b8d5f-cc48-445f-8346-31fdccc49477" />

-`supabase` deploy database : <img width="968" height="458" alt="image" src="https://github.com/user-attachments/assets/d804c35c-0814-4f0d-bf26-9bd91931943b" />
- `tabel data supabase` isi deploy database : <img width="1910" height="596" alt="image" src="https://github.com/user-attachments/assets/295d2357-877b-43b4-9954-441ec0a83e34" />

Jadi `DBeaver` bukan pengganti database, tetapi alat bantu untuk mengelola PostgreSQL.

## Environment Variables

Salin nilai dari `.env.example` ke `.env` jika perlu:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/milstone4?schema=public"
JWT_SECRET="change-this-secret-before-production"
PORT=3000
```

## Installation

```bash
npm install
npm run prisma:generate
```

## Database Setup

Pastikan PostgreSQL sudah berjalan, lalu jalankan:

```bash
npm run prisma:migrate:dev -- --name init
```

Jika ingin mengisi user contoh:

```bash
npm run prisma:seed
```

Seeder membuat:
- `admin@banking.local` / `Admin12345`
- `user@banking.local` / `User12345`

## Running The App

```bash
# development
npm run start:dev

# production build
npm run build
npm run start:prod
```

## Swagger Documentation

Saat aplikasi berjalan, dokumentasi API tersedia di:

```bash
http://localhost:3000/docs
```

Swagger sudah mendokumentasikan:
- request body DTO
- response schema utama
- JWT bearer authentication untuk route private

## Main Endpoints

### Auth
- `POST /auth/register`
- `POST /auth/login`

### User
- `GET /user/profile`
- `PATCH /user/profile`

### Accounts
- `POST /accounts`
- `GET /accounts`
- `GET /accounts/:id`
- `PATCH /accounts/:id`
- `DELETE /accounts/:id`

### Transactions
- `POST /transactions/deposit`
- `POST /transactions/withdraw`
- `POST /transactions/transfer`
- `GET /transactions`
- `GET /transactions/:id`

## Business Rules

- Password disimpan dalam bentuk hash
- Semua route private memakai JWT guard
- User biasa hanya bisa mengakses account dan transaksi miliknya
- Admin dapat melihat semua data
- Withdraw dan transfer akan gagal jika saldo tidak cukup
- Transfer antar mata uang berbeda ditolak
- Account tidak bisa dihapus jika saldo masih ada
- Account tidak bisa dihapus jika sudah punya histori transaksi

## Testing 
<img width="854" height="508" alt="image" src="https://github.com/user-attachments/assets/f5892ff4-6361-4e86-8164-83085bc17d1c" />


Jalankan test berikut:

```bash
# unit tests
npm test -- --runInBand

# e2e tests
npm run test:e2e -- --runInBand
```

## Prisma Files

File penting terkait database:
- `prisma/schema.prisma`
- `prisma/migrations/20260410150000_init/migration.sql`
- `prisma/seed.ts`
- `prisma.config.ts`

## Deployment Suggestion

Rekomendasi deployment:
- Database: `Supabase PostgreSQL`
- Backend: `Railway`

Langkah umum:
1. Buat database PostgreSQL di Supabase.
2. Ambil connection string lalu simpan sebagai `DATABASE_URL` di Railway.
3. Simpan `JWT_SECRET` di environment variables Railway.
4. Railway mendukung config-as-code melalui [railway.toml](/C:/Users/arifb/milstone4/railway.toml), jadi build/start command utama sudah disiapkan di repo ini.
5. Jika ingin mengisi manual di dashboard, gunakan build command:

```bash
npm install && npm run prisma:generate && npm run build
```

6. Gunakan start command:

```bash
npm run prisma:migrate:deploy && npm run start:prod
```

7. Setelah deploy, cek endpoint berikut:

```bash
/health
/docs
```

## Project Structure

```bash
src/
  auth/
  users/
  accounts/
  transactions/
  prisma/
  common/
prisma/
test/
```

## LINK RAILWAY : https://luminous-harmony-production-e4c4.up.railway.app/docs#/Auth/AuthController_login

- Project ini memakai Prisma 7, sehingga koneksi PostgreSQL menggunakan `@prisma/adapter-pg`.
