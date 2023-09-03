import { getServerSession, getToken } from "#auth"
import { PrismaClient, Workspace } from "@prisma/client"
import { SessionWrapper } from "index"
import { pick } from "lodash-es"
import { v4 as uuid } from "uuid"

const postWorkspace = async (event: { context: { prisma: PrismaClient } }, userId: string, jsonObj?: any) => {
  const created = await event.context.prisma.$transaction(async prisma => {
    // 序号从0开始累加，新序号==件数
    const newOrdinal = await prisma.workspace.count({
      where: {
        owner: userId
      }
    })
    console.log('newOrdinal', newOrdinal)

    const id = uuid()
    const data: { businessCategory: string | null, templates: {id: string, name: string, key: string, path: string, placeholders: { id: string, name: string, type: string, format?: string, value?: any}[]}[] } = {businessCategory: null, templates:[]}
    if (jsonObj?.businessCategory) {
      data.businessCategory = jsonObj.businessCategory
    }
    if (jsonObj?.templates && Array.isArray(jsonObj.templates) && jsonObj.templates.length > 0) {
      for (const template of jsonObj.templates) {
        const picked = pick(template, ['id', 'name', 'key', 'path', 'placeholders'])
        data.templates.push(picked)
      }
    }
    return await prisma.workspace.create({
      data: {
        id: id,
        name: `新建替换-${Date.now()}`,
        type: "REPLACEMENT",
        data: data,
        ordinal: newOrdinal,
        owner: userId
      }
    })
  })
  return created
}

export default defineEventHandler(async event => {
  // const token = await getToken({ event })
  // const userId = token?.sub
  const session = await getServerSession(event)
  if (!session) throw createError({ statusMessage: 'Unauthenticated', statusCode: 401 })
  const uid = (session as SessionWrapper).uid
  // if (!userId) {
  //   event.node.res.statusCode = 400
  //   return
  // }
  const jsonObj = await readBody(event)
  return await postWorkspace(event, uid, jsonObj)
})
