// yarn prisma db seed
import { PrismaClient } from '@prisma/client'
import { v4 as uuid } from 'uuid'
const prisma = new PrismaClient()
enum PlaceholderType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date'
}

async function main() {
  // create view
  const roleRel = await prisma.$executeRawUnsafe('CREATE VIEW RoleRel AS SELECT casbin_rule.v0 AS `sub`, casbin_rule.v1 AS `psub` FROM casbin_rule where casbin_rule.ptype = \'g\'')
  console.log(roleRel)

  const adminUserId = 'a4992b3a-2870-47ba-a4d7-ff8852b6a178';
  // initial user data
  const userAdmin = await prisma.user.create({
    data: {
      id: adminUserId,
      name: 'administrator',
      email: 'war3revenger@hotmail.com',
      emailVerified: null,
      image: 'https://api.multiavatar.com/administrator.png',
    },
  })
  // const testUser = await prisma.user.upsert({
  //   where: { username: 'test-user' },
  //   update: {},
  //   create: {
  //     id: 2,
  //     username: 'test-user',
  //     password: '$2b$10$VPdbcpGN54JAO72kjb49Pu8i8qLKVRyHt3KxZyiMWf4IzKbKmi3Lu',
  //     name: '张三',
  //     email: null,
  //     image: 'https://api.multiavatar.com/test-user.png',
  //   },
  // })
  console.log({ userAdmin })

  const accountAdmin = await prisma.account.create({
    data: {
      id: uuid(),
      userId: adminUserId,
      type: 'credentials',
      provider: '-',
      providerAccountId: '-',
      refresh_token: null,
      access_token: '$2b$10$VPdbcpGN54JAO72kjb49Pu8i8qLKVRyHt3KxZyiMWf4IzKbKmi3Lu', // 123456
      expires_at: null,
      token_type: null,
      scope: null,
      id_token: null,
      session_state: null
    }
  })
  console.log({ accountAdmin })

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
      v0: adminUserId,
      v1: 'role_admin',
      v2: null,
      v3: null,
      v4: null,
      v5: null
    }
  })
  console.log({ roleAdminRead, roleReplacementRead, roleOtherRead, roleUserGroupBase, roleUserGroupReplacement, roleAdminGroupUser, roleAdminGroupOther, roleAdmin })

  const createAt = new Date()
  const updateAt = createAt
  const businessCategories = await prisma.businessCategory.createMany({
    data: [
      // { id: '49023c98-07e0-497f-9a26-79ff5512fa7e', pid: '49023c98-07e0-497f-9a26-79ff5512fa7e', name: '$root', icon: null, ordinal: 0, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '6ac0bd6a-c603-4b60-8ec4-4c4eb58da424', pid: null, name: '大分类1', icon: 'mdi-ab-testing', ordinal: 0, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '0fdb16f3-ccb4-4762-b5f9-fae4c6bfe56a', pid: null, name: '大分类2', icon: 'mdi-car-turbocharger', ordinal: 1, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '519ead21-81f5-4164-8553-b3853c94dfcd', pid: null, name: '大分类3', icon: 'mdi-file-table-box-multiple', ordinal: 2, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: 'eb301743-553a-4cd6-858f-a9d2d79904b3', pid: null, name: '大分类4', icon: 'mdi-map-marker-plus', ordinal: 3, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '655c6ce8-1a11-4c77-8752-e31b54c5a73a', pid: null, name: '大分类5', icon: 'mdi-cards-heart', ordinal: 4, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: 'da57da8e-4135-42c6-a340-d7f9408ccb52', pid: null, name: '大分类6', icon: 'mdi-cash-100', ordinal: 5, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '08d0b72e-3c7e-427f-93da-4db3a967e6d3', pid: null, name: '大分类7', icon: 'mdi-cat', ordinal: 6, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '279cd85d-a5f8-43f0-987d-0d9e1c8cff16', pid: null, name: '大分类8', icon: 'mdi-shield-search', ordinal: 7, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '06cc9dfa-3788-4e1c-8ffa-6900cf41615c', pid: null, name: '大分类9', icon: 'mdi-cellphone-play', ordinal: 8, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: 'b856a789-2ae1-4e03-984c-2b416812af37', pid: null, name: '大分类A', icon: 'mdi-flask-empty', ordinal: 9, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '0c1617ec-2d21-44d8-8e7e-48390f78fa7f', pid: '0fdb16f3-ccb4-4762-b5f9-fae4c6bfe56a', name: '中分类21', icon: 'mdi-shovel', ordinal: 0, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '975eee0c-3294-479e-89ae-8f631d0ef23a', pid: '0fdb16f3-ccb4-4762-b5f9-fae4c6bfe56a', name: '中分类22', icon: 'mdi-certificate', ordinal: 1, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '6f7d754c-fcf3-4417-9f6d-9ec2f5d8b552', pid: '0fdb16f3-ccb4-4762-b5f9-fae4c6bfe56a', name: '中分类23', icon: 'mdi-chart-arc', ordinal: 2, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '67ea5055-d51f-4c06-ab2f-c8302718e795', pid: '279cd85d-a5f8-43f0-987d-0d9e1c8cff16', name: '中分类81', icon: 'mdi-airplane', ordinal: 0, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '16e03563-0e8b-4091-a110-d412d41997cd', pid: '279cd85d-a5f8-43f0-987d-0d9e1c8cff16', name: '中分类82', icon: 'mdi-floor-lamp-dual', ordinal: 1, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: 'def3de44-ef7f-41de-bf39-9dc17bd5beba', pid: '279cd85d-a5f8-43f0-987d-0d9e1c8cff16', name: '中分类83', icon: 'mdi-sign-direction', ordinal: 2, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: 'bc2924cd-bc43-4ce1-9d31-5151090e4f06', pid: '975eee0c-3294-479e-89ae-8f631d0ef23a', name: '小分类221', icon: 'mdi-alarm-multiple', ordinal: 0, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '823c505e-1f0b-499a-9c24-2bff18f5358f', pid: '975eee0c-3294-479e-89ae-8f631d0ef23a', name: '小分类222', icon: 'mdi-chart-pie', ordinal: 1, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: 'dd175727-b817-4f3d-83d8-e063c2610bca', pid: '975eee0c-3294-479e-89ae-8f631d0ef23a', name: '小分类223', icon: 'mdi-microsoft', ordinal: 2, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '7e3c6149-2a16-4e59-befe-44e7de5eb9bf', pid: '975eee0c-3294-479e-89ae-8f631d0ef23a', name: '小分类224', icon: 'mdi-signal-cellular-3', ordinal: 3, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '44e4bb80-c2ff-4128-a960-6b19b9918fba', pid: '975eee0c-3294-479e-89ae-8f631d0ef23a', name: '小分类225', icon: 'mdi-alert-octagram', ordinal: 4, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: 'fb66299b-27bc-4fba-b0f6-48b399a9fe3c', pid: '975eee0c-3294-479e-89ae-8f631d0ef23a', name: '小分类226', icon: 'mdi-microsoft-xbox', ordinal: 5, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: 'a6a4af63-1fd8-434b-b4d5-3def2212704c', pid: '975eee0c-3294-479e-89ae-8f631d0ef23a', name: '小分类227', icon: 'mdi-alpha-b-box', ordinal: 6, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: 'f00c9f7b-f6f4-4f3e-b6b3-347c119334f1', pid: '975eee0c-3294-479e-89ae-8f631d0ef23a', name: '小分类228', icon: 'mdi-skull', ordinal: 7, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '5c1bdfcf-3cde-47bd-a099-834664196470', pid: '975eee0c-3294-479e-89ae-8f631d0ef23a', name: '小分类229', icon: 'mdi-chess-bishop', ordinal: 8, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '4af1f4ac-eace-4c95-b76a-d08efa533059', pid: '975eee0c-3294-479e-89ae-8f631d0ef23a', name: '小分类22A', icon: 'mdi-food-croissant', ordinal: 0, createdAt: createAt, updatedAt: updateAt, version: 0 }
    ]
  })
  console.log(businessCategories)

  const templates = await prisma.template.createMany({
    data: [
      { id: '99fe65e0-90ac-41ef-91a1-aa3b4d4a09cd', name: '小分类229-模板A', path: '/5c1bdfcf-3cde-47bd-a099-834664196470/template_a.docx', createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: 'cfba1cfa-1f1c-45d5-b223-6145c75a0528', name: '小分类229-模板B', path: '/5c1bdfcf-3cde-47bd-a099-834664196470/template_b.docx', createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '6a9f12fe-cf86-4f39-bf55-86c33724d25c', name: '中分类21-模板A', path: '/0c1617ec-2d21-44d8-8e7e-48390f78fa7f/template_a.docx', createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '9eb1db1c-639b-49e9-9341-bbf0b25f6841', name: '中分类21-模板B', path: '/0c1617ec-2d21-44d8-8e7e-48390f78fa7f/template_b.docx', createdAt: createAt, updatedAt: updateAt, version: 0 },
    ]
  })
  console.log(templates)

  const placeholderItems = await prisma.placeholderItem.createMany({
    data: [
      { id: '6369f6c3-67e1-45f1-ac9f-6bbcf325c434', name: '原告', type: PlaceholderType.TEXT, format: null, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '7ef7390c-e78e-4681-b105-893e325457e6', name: '被告', type: PlaceholderType.TEXT, format: null, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: 'fec05590-6202-479b-8735-409ded3b9905', name: '金额', type: PlaceholderType.NUMBER, format: null, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: 'd4e98926-a657-4412-9bb5-463a4419bdfa', name: '日期', type: PlaceholderType.DATE, format: 'YYYY年MM月DD日', createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '40b457f2-7708-40a9-a3f7-4c1f4da5d128', name: '法院', type: PlaceholderType.TEXT, format: null, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: 'bd99b029-0177-4030-82a7-b4a79bea497a', name: '案由', type: PlaceholderType.TEXT, format: null, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: 'a70d08eb-ca4e-44f7-8339-71885f115376', name: '地址', type: PlaceholderType.TEXT, format: null, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { id: '26d17448-3f72-4a9f-b6a4-b25bc635b062', name: '电话号码', type: PlaceholderType.NUMBER, format: null, createdAt: createAt, updatedAt: updateAt, version: 0 },
    ]
  })
  console.log(placeholderItems)

  const placeholderTags = await prisma.placeholderTag.createMany({
    data: [
      { id: '14c88a51-b889-4b74-b1d1-050965b4e8a0', name: '主体', createdAt: createAt, updatedAt: updateAt, version: 0 }
    ]
  })
  console.log(placeholderTags)

  const bcTplRels = await prisma.bcTplRel.createMany({
    data: [
      { bcId: '5c1bdfcf-3cde-47bd-a099-834664196470', tplId: '99fe65e0-90ac-41ef-91a1-aa3b4d4a09cd', ordinal: 0, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { bcId: '5c1bdfcf-3cde-47bd-a099-834664196470', tplId: 'cfba1cfa-1f1c-45d5-b223-6145c75a0528', ordinal: 1, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { bcId: '0c1617ec-2d21-44d8-8e7e-48390f78fa7f', tplId: '6a9f12fe-cf86-4f39-bf55-86c33724d25c', ordinal: 0, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { bcId: '0c1617ec-2d21-44d8-8e7e-48390f78fa7f', tplId: '9eb1db1c-639b-49e9-9341-bbf0b25f6841', ordinal: 1, createdAt: createAt, updatedAt: updateAt, version: 0 },
    ]
  })
  console.log(bcTplRels)

  const tplPhItmRels = await prisma.tplPhItmRel.createMany({
    data: [
      { tplId: '99fe65e0-90ac-41ef-91a1-aa3b4d4a09cd', phItmId: '6369f6c3-67e1-45f1-ac9f-6bbcf325c434', ordinal: 0, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { tplId: '99fe65e0-90ac-41ef-91a1-aa3b4d4a09cd', phItmId: '7ef7390c-e78e-4681-b105-893e325457e6', ordinal: 1, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { tplId: 'cfba1cfa-1f1c-45d5-b223-6145c75a0528', phItmId: 'fec05590-6202-479b-8735-409ded3b9905', ordinal: 0, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { tplId: 'cfba1cfa-1f1c-45d5-b223-6145c75a0528', phItmId: 'd4e98926-a657-4412-9bb5-463a4419bdfa', ordinal: 1, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { tplId: '6a9f12fe-cf86-4f39-bf55-86c33724d25c', phItmId: '40b457f2-7708-40a9-a3f7-4c1f4da5d128', ordinal: 0, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { tplId: '6a9f12fe-cf86-4f39-bf55-86c33724d25c', phItmId: 'bd99b029-0177-4030-82a7-b4a79bea497a', ordinal: 1, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { tplId: '9eb1db1c-639b-49e9-9341-bbf0b25f6841', phItmId: 'a70d08eb-ca4e-44f7-8339-71885f115376', ordinal: 0, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { tplId: '9eb1db1c-639b-49e9-9341-bbf0b25f6841', phItmId: '26d17448-3f72-4a9f-b6a4-b25bc635b062', ordinal: 1, createdAt: createAt, updatedAt: updateAt, version: 0 },
    ]
  })
  console.log(tplPhItmRels)

  const phItmTagRels = await prisma.phItmTagRel.createMany({
    data: [
      { phItmId: '6369f6c3-67e1-45f1-ac9f-6bbcf325c434', phTagId: '14c88a51-b889-4b74-b1d1-050965b4e8a0', ordinal: 0, createdAt: createAt, updatedAt: updateAt, version: 0 },
      { phItmId: '7ef7390c-e78e-4681-b105-893e325457e6', phTagId: '14c88a51-b889-4b74-b1d1-050965b4e8a0', ordinal: 0, createdAt: createAt, updatedAt: updateAt, version: 0 }
    ]
  })
  console.log(phItmTagRels)

  const workspace = await prisma.workspace.createMany({
    data: [
      {
        type: 'REPLACEMENT', owner: adminUserId, data: [
          {
            id: '43ccacc1-a062-4a84-9219-ea1cd1a5704d',
            name: '替换1',
            businessCategory: '5c1bdfcf-3cde-47bd-a099-834664196470',
            templates: [
              {
                id: '99fe65e0-90ac-41ef-91a1-aa3b4d4a09cd',
                name: '小分类229-模板A',
                path: '/5c1bdfcf-3cde-47bd-a099-834664196470/template_a.docx',
                placeholders: [
                  {
                    id: '6369f6c3-67e1-45f1-ac9f-6bbcf325c434',
                    value: '原告1'
                  },
                  {
                    id: '7ef7390c-e78e-4681-b105-893e325457e6',
                    value: '被告1'
                  }
                ]
              },
              {
                id: 'cfba1cfa-1f1c-45d5-b223-6145c75a0528',
                name: '小分类229-模板B',
                path: '/5c1bdfcf-3cde-47bd-a099-834664196470/template_b.docx',
                placeholders: [
                  {
                    id: 'fec05590-6202-479b-8735-409ded3b9905',
                    value: '10000'
                  },
                  {
                    id: 'd4e98926-a657-4412-9bb5-463a4419bdfa',
                    value: '2021-05-12'
                  }
                ]
              }
            ]
          },
          {
            id: '378cf3c1-1900-4a86-b7ae-28633a4e72b1',
            name: '替换2',
            businessCategory: '0c1617ec-2d21-44d8-8e7e-48390f78fa7f',
            templates: [
              {
                id: '6a9f12fe-cf86-4f39-bf55-86c33724d25c',
                name: '中分类21-模板A',
                path: '/0c1617ec-2d21-44d8-8e7e-48390f78fa7f/template_a.docx',
                placeholders: [
                  {
                    id: '40b457f2-7708-40a9-a3f7-4c1f4da5d128',
                    value: '法院1'
                  },
                  {
                    id: 'bd99b029-0177-4030-82a7-b4a79bea497a',
                    value: '案由1'
                  }
                ]
              },
              {
                id: '9eb1db1c-639b-49e9-9341-bbf0b25f6841',
                name: '中分类21-模板B',
                path: '/0c1617ec-2d21-44d8-8e7e-48390f78fa7f/template_b.docx',
                placeholders: [
                  {
                    id: 'a70d08eb-ca4e-44f7-8339-71885f115376',
                    value: '地址1'
                  },
                  {
                    id: '26d17448-3f72-4a9f-b6a4-b25bc635b062',
                    value: '13800000000'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  })
  console.log(workspace)
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
