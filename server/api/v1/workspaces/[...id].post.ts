import { getToken } from "#auth"
import { Prisma, PrismaClient } from "@prisma/client"
import { IncomingMessage, ServerResponse } from "http"
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { join, basename, resolve } from 'path'
import { omit, pick } from "lodash-es"

const REGEX_WORKSPACES_SWITCH_BUSINESSCATEGORY = /^([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\/switch-bcid\/([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})$/
const WORKSPACE_DIR = 'workspace'
const { storageConfigFolder } = useDocConfig()

const switchBcId = async (event: { node: { res: ServerResponse<IncomingMessage> }, context: { prisma: PrismaClient } }, id: string, bcId: string) => {
  const result = await event.context.prisma.$transaction(async prisma => {
    if (bcId === '00000000-0000-0000-0000-000000000000') {
      return await prisma.workspace.update({
        data: {
          name: `新建替换-${Date.now()}`,
          data: {},
          version: {
            increment: 1
          }
        },
        where: {
          id: id
        }
      })
    }
    const existedWorkdata = await prisma.workspace.findFirst({
      where: {
        id: id
      }
    })
    // 当 存在已选定业务分类的数据时，立即返回结果
    if (existedWorkdata?.data && (existedWorkdata.data as Prisma.JsonObject)['businessCategory'] === bcId) {
      return existedWorkdata
    }
    const rawTemplates = await prisma.template.findMany({
      select: {
        id: true,
        name: true,
        path: true,
        placeholderItems: {
          include: {
            placeholderItem: {
              select: {
                id: true,
                name: true,
                type: true,
                format: true
              }
            }
          },
          orderBy: {
            ordinal: 'asc'
          }
        }
      },
      where: {
        businessCategories: {
          some: {
            bcId: bcId
          }
        }
      }
    })
    const templates = rawTemplates.map(template => {
      const tplPath = join(storageConfigFolder, template.path)
      const wsTplDir = join(storageConfigFolder, WORKSPACE_DIR, id, 'replacement', template.id)
      if (!existsSync(wsTplDir)) {
        mkdirSync(wsTplDir, { recursive: true })
      }
      const wsTplPath = join(wsTplDir, basename(tplPath))
      // 默认覆盖存在的文件
      copyFileSync(tplPath, wsTplPath)
      const docPath = ['', WORKSPACE_DIR, id, 'replacement', template.id, basename(tplPath)].join('/')
      return {
        ...pick(template, ['id', 'name']),
        path: docPath,
        placeholders: template.placeholderItems.map(({ placeholderItem }) => ({...placeholderItem, value: null, status: 0}))
      }
    })
    const businessCategory = await prisma.businessCategory.findFirst({
      select: {
        name: true
      },
      where: {
        id: bcId
      }
    })

    return await prisma.workspace.update({
      data: {
        name: businessCategory ? businessCategory.name : '新建替换',
        data: {
          businessCategory: bcId,
          templates: templates
        },
        version: {
          increment: 1
        }
      },
      where: {
        id: id
      }
    })
  })

  return result
}

export default defineEventHandler(async event => {
  const params = event.context.params?.id
  if (params) {
    if (REGEX_WORKSPACES_SWITCH_BUSINESSCATEGORY.test(params)) {
      const [ _, id, bcId ] = params.match(REGEX_WORKSPACES_SWITCH_BUSINESSCATEGORY)!
      const { type } = await readBody(event)
      switch (type) {
        case 'REPLACEMENT':
          return await switchBcId(event, id, bcId)
        default:
          // TODO
      }
    }
  }
  // const token = await getToken({ event })
  // const userId = token?.sub
  // if (!userId) {
  //   event.node.res.statusCode = 400
  //   return
  // }
  // const jsonObj = await readBody(event)
  // return await postWorkspace(event, userId, jsonObj)
})
