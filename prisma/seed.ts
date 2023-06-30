// yarn prisma db seed
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  // create view
  const roleRel = await prisma.$executeRawUnsafe('CREATE VIEW RoleRel AS SELECT casbin_rule.v0 AS `sub`, casbin_rule.v1 AS `psub` FROM casbin_rule where casbin_rule.ptype = \'g\'')
  console.log(roleRel)

  // initial user data
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      id: 1,
      username: 'admin',
      password: '$2b$10$VPdbcpGN54JAO72kjb49Pu8i8qLKVRyHt3KxZyiMWf4IzKbKmi3Lu',
      name: 'administrator',
      email: null,
      image: null,
    },
  })
  const testUser = await prisma.user.upsert({
    where: { username: 'test-user' },
    update: {},
    create: {
      id: 2,
      username: 'test-user',
      password: '$2b$10$VPdbcpGN54JAO72kjb49Pu8i8qLKVRyHt3KxZyiMWf4IzKbKmi3Lu',
      name: 'test user',
      email: null,
      image: null,
    },
  })
  console.log({ admin, testUser })

  // initial casbinRule data
  const roleAdminRead = await prisma.casbinRule.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      ptype: 'p',
      v0: 'role_admin',
      v1: '/',
      v2: 'read',
      v3: null,
      v4: null,
      v5: null
    }
  })
  const roleAdminWrite = await prisma.casbinRule.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      ptype: 'p',
      v0: 'role_admin',
      v1: '/',
      v2: 'write',
      v3: null,
      v4: null,
      v5: null
    }
  })
  const roleUserRead = await prisma.casbinRule.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      ptype: 'p',
      v0: 'role_user',
      v1: '/',
      v2: 'read',
      v3: null,
      v4: null,
      v5: null
    }
  })
  const roleUserWrite = await prisma.casbinRule.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      ptype: 'p',
      v0: 'role_user',
      v1: '/',
      v2: 'write',
      v3: null,
      v4: null,
      v5: null
    }
  })
  const roleAdminGroup = await prisma.casbinRule.upsert({
    where: { id: 5 },
    update: {},
    create: {
      id: 5,
      ptype: 'g',
      v0: 'admin',
      v1: 'role_admin',
      v2: null,
      v3: null,
      v4: null,
      v5: null
    }
  })
  const roleUserGroup = await prisma.casbinRule.upsert({
    where: { id: 6 },
    update: {},
    create: {
      id: 6,
      ptype: 'g',
      v0: 'test-user',
      v1: 'role_user',
      v2: null,
      v3: null,
      v4: null,
      v5: null
    }
  })
  console.log({ roleAdminRead, roleAdminWrite, roleUserRead, roleUserWrite, roleAdminGroup, roleUserGroup })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })