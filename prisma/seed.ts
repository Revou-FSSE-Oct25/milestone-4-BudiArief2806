import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Seeder ini membantu reviewer atau developer cepat mendapatkan akun admin
  // dan user biasa tanpa perlu registrasi manual setiap kali setup ulang.
  const adminPasswordHash = await bcrypt.hash('Admin12345', 10);
  const userPasswordHash = await bcrypt.hash('User12345', 10);

  await prisma.user.upsert({
    where: { email: 'admin@banking.local' },
    update: {},
    create: {
      fullName: 'System Admin',
      email: 'admin@banking.local',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      phone: '+628111111111',
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@banking.local' },
    update: {},
    create: {
      fullName: 'Sample User',
      email: 'user@banking.local',
      passwordHash: userPasswordHash,
      role: UserRole.USER,
      phone: '+628222222222',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
