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
      image: 'https://api.multiavatar.com/administrator.png',
    },
  })
  const testUser = await prisma.user.upsert({
    where: { username: 'test-user' },
    update: {},
    create: {
      id: 2,
      username: 'test-user',
      password: '$2b$10$VPdbcpGN54JAO72kjb49Pu8i8qLKVRyHt3KxZyiMWf4IzKbKmi3Lu',
      name: '张三',
      email: null,
      image: 'https://api.multiavatar.com/test-user.png',
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
      v0: 'role_base',
      v1: '/',
      v2: 'read',
      v3: null,
      v4: null,
      v5: null
    }
  })
  const roleReplacementRead = await prisma.casbinRule.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      ptype: 'p',
      v0: 'role_replacement',
      v1: '/replacement',
      v2: 'read',
      v3: null,
      v4: null,
      v5: null
    }
  })
  const roleOtherRead = await prisma.casbinRule.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      ptype: 'p',
      v0: 'role_other',
      v1: '/prisma',
      v2: 'read',
      v3: null,
      v4: null,
      v5: null
    }
  })
  const roleUserGroupBase = await prisma.casbinRule.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      ptype: 'g',
      v0: 'role_user',
      v1: 'role_base',
      v2: null,
      v3: null,
      v4: null,
      v5: null
    }
  })
  const roleUserGroupReplacement = await prisma.casbinRule.upsert({
    where: { id: 5 },
    update: {},
    create: {
      id: 5,
      ptype: 'g',
      v0: 'role_user',
      v1: 'role_replacement',
      v2: null,
      v3: null,
      v4: null,
      v5: null
    }
  })
  const roleAdminGroupUser = await prisma.casbinRule.upsert({
    where: { id: 6 },
    update: {},
    create: {
      id: 6,
      ptype: 'g',
      v0: 'role_admin',
      v1: 'role_user',
      v2: null,
      v3: null,
      v4: null,
      v5: null
    }
  })
  const roleAdminGroupOther = await prisma.casbinRule.upsert({
    where: { id: 7 },
    update: {},
    create: {
      id: 7,
      ptype: 'g',
      v0: 'role_admin',
      v1: 'role_other',
      v2: null,
      v3: null,
      v4: null,
      v5: null
    }
  })
  const roleAdmin = await prisma.casbinRule.upsert({
    where: { id: 8 },
    update: {},
    create: {
      id: 8,
      ptype: 'g',
      v0: 'admin',
      v1: 'role_admin',
      v2: null,
      v3: null,
      v4: null,
      v5: null
    }
  })
  const roleTestUser = await prisma.casbinRule.upsert({
    where: { id: 9 },
    update: {},
    create: {
      id: 9,
      ptype: 'g',
      v0: 'test-user',
      v1: 'role_user',
      v2: null,
      v3: null,
      v4: null,
      v5: null
    }
  })
  console.log({ roleAdminRead, roleReplacementRead, roleOtherRead, roleUserGroupBase, roleUserGroupReplacement, roleAdminGroupUser, roleAdminGroupOther, roleAdmin, roleTestUser })
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
