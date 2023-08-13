import { PlaceholderItem, Prisma, PrismaClient } from "@prisma/client"
import { v4 as uuid } from "uuid"
import { pick } from "lodash-es";
import { IncomingMessage, ServerResponse } from "http";
import { EditMode } from "composables/dialog";

const REGEX_PLACEHOLDERS_IN_TEMPLATES_POST = /^([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\/placeholders$/
const REGEX_PLACEHOLDERS_IN_TEMPLATES_SORT = /^([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\/placeholders\/sort$/
const REGEX_PLACEHOLDERS_IN_TEMPLATES_BATCH_SAVE = /^([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\/placeholders\/batchsave$/
/**
 *
 * @api {post} /api/templates/:id/placeholders （新建并）关联占位符到指定模板
 * @apiName （新建并）关联占位符到指定模板
 * @apiGroup templates
 * @apiVersion  1.0.0
 *
 * @apiParam {Number} id 模板id
 *
 * @apiBody {String} id 占位符id
 * @apiBody {String} name 占位符名称
 * @apiBody {String} type 占位符类型
 * @apiBody {String} format 占位符格式
 *
 * @apiSuccess (200) {Object} placeholderItem 占位符对象
 * @apiSuccess (200) {Number} placeholderItem.id 占位符id
 * @apiSuccess (200) {String} placeholderItem.name 占位符名称
 * @apiSuccess (200) {String} placeholderItem.type 占位符类型
 * @apiSuccess (200) {String} placeholderItem.format 占位符格式
 * @apiSuccess (200) {Date} placeholderItem.createdAt createdAt
 * @apiSuccess (200) {Date} placeholderItem.updatedAt updatedAt
 * @apiSuccess (200) {Number} placeholderItem.version version
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *        "id": "id",
 *        "name": "name",
 *        "type": "text",
 *        "format": "",
 *        "createdAt": Date,
 *        "updatedAt": Date,
 *        "version": 0,
 *      }
 *
 */
const postPlaceholdersInTemplates = async (event: { context: { prisma: PrismaClient } }, tplId: string, item: PlaceholderItem) => {
  // ※新添加占位符必须与模板绑定
  // if (!tplId) {
  //   throw new Error('未指定模板id')
  // }
  try {
    const created = await event.context.prisma.$transaction(async prisma => {
      // 序号从0开始累加，新序号==件数
      const newOrdinal = await prisma.tplPhItmRel.count({
        where: {
          tplId: tplId
        }
      })
      console.log('newOrdinal', newOrdinal)
      const dataForCreate = pick(item, ['name', 'type', 'format'])

      if (item.id) {
        // 若 占位符已存在，则 关联到指定模板
        await prisma.tplPhItmRel.create({
          data: {
            tplId: tplId,
            phItmId: item.id,
            ordinal: newOrdinal,
            version: 0
          }
        })
        return await prisma.placeholderItem.findUnique({
          where: {
            id: item.id
          }
        })
      } else {
        // 若 占位符不存在，则 新建占位符并关联到指定模板
        const id = uuid()
        return await prisma.placeholderItem.create({
          data: {
            id: id,
            ...dataForCreate,
            version: 0,
            templates: {
              create: {
                ordinal: newOrdinal,
                version: 0,
                template: {
                  connect: {
                    id: tplId
                  }
                }
              }
            }
          }
        })
      }
    })
    return created
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new Error(`存在唯一约束冲突，无法使用名称<${item.name}>`)
    } else {
      throw e
    }
  }
}

/**
 *
 * @api {post} /api/templates/:id/placeholders/sort 对关联指定模板的占位符排序
 * @apiName 对关联指定模板的占位符排序
 * @apiGroup templates
 * @apiVersion  1.0.0
 *
 * @apiParam {Number} id 模板id
 *
 * @apiBody {Object[]} placeholderItem 占位符数组
 * @apiBody {String} placeholderItem.id 占位符id
 * @apiBody {Number} placeholderItem.ordinal 序号
 * @apiBody {Number} placeholderItem.version version
 *
 * @apiParamExample  {json} Request-Example:
 * [
 *   {
 *     tplId: "1", id: "1", ordinal: 1, version: 0
 *   },
 *   {
 *     tplId: "1", id: "2", ordinal: 0, version: 0
 *   }
 * ]
 *
 * @apiError (400) SortTargetUndefined 未指定排序对象
 *
 * @apiErrorExample {json} Error-Response:
 * {
 *   error: "SortTargetUndefined"
 * }
 *
 */
const postPlaceholdersInTemplatesSort = async (event: { node: { res: ServerResponse<IncomingMessage> }, context: { prisma: PrismaClient } }, tplId: string, items: PlaceholderItemSort[]) => {
  if (!Array.isArray(items) || items.length == 0) {
    event.node.res.statusCode = 400
    return
  }
  const executed = await event.context.prisma.$transaction(async prisma => {
    for (const item of items) {
      await prisma.tplPhItmRel.update({
        where: {
          tplId_phItmId: {
            tplId: tplId as string,
            phItmId: item.id
          },
          placeholderItem: {
            version: item.version
          }
        },
        data: {
          ordinal: item.ordinal,
          updatedAt: new Date(),
          version: {
            increment: 1
          }
        }
      })
    }
    return true
  })

  return executed
}

/**
 *
 * @api {post} /api/templates/:id/placeholders/batchsave 批量保存关联指定模板的占位符
 * @apiName 批量保存关联指定模板的占位符
 * @apiGroup templates
 * @apiVersion  1.0.0
 *
 * @apiParam {Number} id 模板id
 *
 * @apiBody {Object[]} placeholderItem 占位符数组
 * @apiBody {String} placeholderItem.id 占位符id
 * @apiBody {String} placeholderItem.name 占位符名称
 * @apiBody {String} placeholderItem.type 占位符类型
 * @apiBody {String} placeholderItem.format 占位符格式
 *
 * @apiParamExample  {json} Request-Example:
 * [
 *   {
 *     id: "1", name: "1111", type: "text" format: ""
 *   },
 *   {
 *     id: "", name: "2222", type: "date" format: "YYYY/MM/DD"
 *   }
 * ]
 *
 * @apiError (400) BatchSaveTargetUndefined 未指定保存对象
 *
 * @apiErrorExample {json} Error-Response:
 * {
 *   error: "BatchSaveTargetUndefined"
 * }
 *
 *
 */
const postPlaceholdersInTemplatesBatchSave = async (event: { node: { res: ServerResponse<IncomingMessage> }, context: { prisma: PrismaClient } }, tplId: string, items: PlaceholderItem[]) => {
  if (!Array.isArray(items) || items.length == 0) {
    event.node.res.statusCode = 400
    return
  }
  const executed = await event.context.prisma.$transaction(async prisma => {
    for (const item of items) {
      // 序号从0开始累加，新序号==件数
      const newOrdinal = await prisma.tplPhItmRel.count({
        where: {
          tplId: tplId
        }
      })
      console.log('newOrdinal', newOrdinal)
      const dataForCreate = pick(item, ['name', 'type', 'format'])

      if (item.id) {
        // 若 占位符已存在，则 关联到指定模板
        await prisma.tplPhItmRel.create({
          data: {
            tplId: tplId,
            phItmId: item.id,
            ordinal: newOrdinal,
            version: 0
          }
        })
      } else {
        // 若 占位符不存在，则 新建占位符并关联到指定模板
        const id = uuid()
        await prisma.placeholderItem.create({
          data: {
            id: id,
            ...dataForCreate,
            version: 0,
            templates: {
              create: {
                ordinal: newOrdinal,
                version: 0,
                template: {
                  connect: {
                    id: tplId
                  }
                }
              }
            }
          }
        })
      }
    }
    return true
  })

  return executed
}

type PlaceholderItemSort = Pick<PlaceholderItem, 'id' | 'version'> & { ordinal: number }
export default defineEventHandler(async event => {
  const params = event.context.params?.id
  if (params) {
    if (REGEX_PLACEHOLDERS_IN_TEMPLATES_POST.test(params)) {
      // POST /api/templates/:id/placeholders
      const tplId = params.replace(REGEX_PLACEHOLDERS_IN_TEMPLATES_POST, "$1")
      const item = await readBody<PlaceholderItem>(event)
      return await postPlaceholdersInTemplates(event, tplId, item)
    } else if (REGEX_PLACEHOLDERS_IN_TEMPLATES_SORT.test(params)) {
      // POST /api/templates/:id/placeholders/sort
      const tplId = params.replace(REGEX_PLACEHOLDERS_IN_TEMPLATES_SORT, "$1")
      const items = await readBody<PlaceholderItemSort[]>(event)
      return await postPlaceholdersInTemplatesSort(event, tplId, items)
    } else if (REGEX_PLACEHOLDERS_IN_TEMPLATES_BATCH_SAVE.test(params)) {
      // POST /api/templates/:id/placeholders/batchsave
      const tplId = params.replace(REGEX_PLACEHOLDERS_IN_TEMPLATES_BATCH_SAVE, "$1")
      const items = await readBody<PlaceholderItem[]>(event)
      return await postPlaceholdersInTemplatesBatchSave(event, tplId, items)
    }
  }
})
