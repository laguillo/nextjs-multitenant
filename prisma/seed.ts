import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from '@better-auth/utils/password';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const PASSWORD = 'Demo@1234!';

const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
  bold: '\x1b[1m'
};

function log(icon: string, msg: string) {
  console.log(`  ${icon}  ${msg}`);
}

async function main() {
  console.log(`\n${c.bold}${c.blue}Seeding database...${c.reset}\n`);

  console.log(`${c.gray}Clearing existing data...${c.reset}`);
  await prisma.invitation.deleteMany();
  await prisma.member.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();

  console.log(`\n${c.bold}Users${c.reset}`);

  const [
    adminHash,
    aliceHash,
    bobHash,
    carolHash,
    davidHash,
    eveHash
  ] = await Promise.all([
    hashPassword(PASSWORD),
    hashPassword(PASSWORD),
    hashPassword(PASSWORD),
    hashPassword(PASSWORD),
    hashPassword(PASSWORD),
    hashPassword(PASSWORD)
  ]);

  const now = new Date();

  // admin@demo.com — Platform admin
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@demo.com',
      emailVerified: true,
      role: 'admin',
      createdAt: now,
      updatedAt: now,
      accounts: {
        create: {
          accountId: 'admin@demo.com',
          providerId: 'credential',
          password: adminHash,
          createdAt: now,
          updatedAt: now
        }
      }
    }
  });
  log(c.green + '✓' + c.reset, `admin@demo.com          ${c.gray}role: admin${c.reset}`);

  const alice = await prisma.user.create({
    data: {
      name: 'Alice Martínez',
      email: 'alice@demo.com',
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
      accounts: {
        create: {
          accountId: 'alice@demo.com',
          providerId: 'credential',
          password: aliceHash,
          createdAt: now,
          updatedAt: now
        }
      }
    }
  });
  log(c.green + '✓' + c.reset, `alice@demo.com          ${c.gray}owner of Acme Corp${c.reset}`);

  const bob = await prisma.user.create({
    data: {
      name: 'Bob González',
      email: 'bob@demo.com',
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
      accounts: {
        create: {
          accountId: 'bob@demo.com',
          providerId: 'credential',
          password: bobHash,
          createdAt: now,
          updatedAt: now
        }
      }
    }
  });
  log(c.green + '✓' + c.reset, `bob@demo.com            ${c.gray}owner of Globex${c.reset}`);

  const carol = await prisma.user.create({
    data: {
      name: 'Carol López',
      email: 'carol@demo.com',
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
      accounts: {
        create: {
          accountId: 'carol@demo.com',
          providerId: 'credential',
          password: carolHash,
          createdAt: now,
          updatedAt: now
        }
      }
    }
  });
  log(c.green + '✓' + c.reset, `carol@demo.com          ${c.gray}member of Acme Corp${c.reset}`);

  const david = await prisma.user.create({
    data: {
      name: 'David Ramírez',
      email: 'david@demo.com',
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
      accounts: {
        create: {
          accountId: 'david@demo.com',
          providerId: 'credential',
          password: davidHash,
          createdAt: now,
          updatedAt: now
        }
      }
    }
  });
  log(c.green + '✓' + c.reset, `david@demo.com          ${c.gray}member of both orgs${c.reset}`);

  await prisma.user.create({
    data: {
      name: 'Eve Sánchez',
      email: 'eve@demo.com',
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
      accounts: {
        create: {
          accountId: 'eve@demo.com',
          providerId: 'credential',
          password: eveHash,
          createdAt: now,
          updatedAt: now
        }
      }
    }
  });
  log(c.yellow + '~' + c.reset, `eve@demo.com            ${c.gray}unverified, no org${c.reset}`);

  console.log(`\n${c.bold}Organizations${c.reset}`);

  const acme = await prisma.organization.create({
    data: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      createdAt: now
    }
  });
  log(c.green + '✓' + c.reset, `Acme Corporation        ${c.gray}slug: acme-corp${c.reset}`);

  const globex = await prisma.organization.create({
    data: {
      name: 'Globex Industries',
      slug: 'globex',
      createdAt: now
    }
  });
  log(c.green + '✓' + c.reset, `Globex Industries       ${c.gray}slug: globex${c.reset}`);

  console.log(`\n${c.bold}Members${c.reset}`);

  const memberships = [
    { user: alice, org: acme, role: 'owner' },
    { user: carol, org: acme, role: 'member' },
    { user: david, org: acme, role: 'member' },
    { user: admin, org: acme, role: 'member' },
    { user: bob, org: globex, role: 'owner' },
    { user: david, org: globex, role: 'member' }
  ];

  for (const { user, org, role } of memberships) {
    await prisma.member.create({
      data: {
        userId: user.id,
        organizationId: org.id,
        role,
        createdAt: now
      }
    });
    log(
      c.green + '✓' + c.reset,
      `${user.name.padEnd(18)} ${c.gray}→ ${org.name} (${role})${c.reset}`
    );
  }

  console.log(`\n${c.bold}Invitations${c.reset}`);

  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await prisma.invitation.create({
    data: {
      id: crypto.randomUUID(),
      email: 'frank@demo.com',
      inviterId: alice.id,
      organizationId: acme.id,
      role: 'member',
      status: 'pending',
      createdAt: now,
      expiresAt
    }
  });
  log(
    c.yellow + '~' + c.reset,
    `frank@demo.com          ${c.gray}invited to Acme Corp (pending)${c.reset}`
  );

  console.log(`\n${'─'.repeat(56)}`);
  console.log(`${c.bold}${c.green}Done!${c.reset} Seed complete.\n`);
  console.log(`${c.bold}Test accounts${c.reset} (password: ${c.bold}${PASSWORD}${c.reset})\n`);

  const accounts = [
    ['admin@demo.com',  'Platform admin — /admin + /dashboard'],
    ['alice@demo.com',  'Owner of Acme Corp — /tenant/acme-corp'],
    ['bob@demo.com',    'Owner of Globex — /tenant/globex'],
    ['carol@demo.com',  'Member of Acme Corp'],
    ['david@demo.com',  'Member of Acme Corp + Globex'],
    ['eve@demo.com',    'Unverified — tests email verification flow']
  ];

  for (const [email, desc] of accounts) {
    console.log(`  ${c.blue}${email.padEnd(22)}${c.reset} ${c.gray}${desc}${c.reset}`);
  }
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
