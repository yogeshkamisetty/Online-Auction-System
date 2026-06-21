// Bootstrap / promote an admin user.
// Usage:
//   node prisma/makeAdmin.js admin@goldenhammer.com "AdminPass123"   → create-or-promote
//   node prisma/makeAdmin.js existing@user.com                        → promote existing user
require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email) {
    console.error('Usage: node prisma/makeAdmin.js <email> [password]');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    const data = { role: 'ADMIN', suspended: false };
    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }
    const updated = await prisma.user.update({
      where: { email },
      data,
    });
    console.log(`Promoted existing user to ADMIN and updated password: ${updated.email}`);
  } else {
    if (!password) {
      console.error('User does not exist — provide a password to create the admin.');
      process.exit(1);
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: { email, name: 'Administrator', passwordHash, role: 'ADMIN' },
    });
    console.log(`Created new ADMIN user: ${created.email}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
