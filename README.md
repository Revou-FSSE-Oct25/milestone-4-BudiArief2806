# Banking API Fundamental Project

REST API perbankan sederhana menggunakan `NestJS`, `Prisma`, `PostgreSQL`, `JWT`, dan `Swagger`.

Project ini memenuhi requirement fundamental berikut:
- Prisma schema dengan model `User`, `Account`, dan `Transaction`
- Relasi database yang jelas dan index dasar untuk performa
- Auth JWT untuk endpoint private
- CRUD account
- Deposit, withdraw, dan transfer
- DTO validation dengan `class-validator`
- Swagger documentation
- Unit test dan e2e test

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
- `PostgreSQL` berperan sebagai database utama
- `DBeaver` bisa dipakai sebagai GUI client untuk melihat table, relasi, dan data

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

## Notes

- Project ini memakai Prisma 7, sehingga koneksi PostgreSQL menggunakan `@prisma/adapter-pg`.
- Komentar `//` sudah ditambahkan di bagian alur penting agar lebih mudah dibaca saat review.
