import { Template, Prisma, PrismaClient, BusinessCategory } from "@prisma/client"
import { v4 as uuid } from "uuid"
import { pick } from "lodash-es";
import { IncomingMessage, ServerResponse } from "http";

const REGEX_TEMPLATES_IN_BUSINESSCATEGORIES_POST = /^([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\/templates$/
const REGEX_TEMPLATES_IN_BUSINESSCATEGORIES_SORT = /^([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\/templates\/sort$/
const REGEX_BUSINESSCATEGORIES_IN_BUSINESSCATEGORIES_POST = /^([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\/businesscategories$/
const REGEX_BUSINESSCATEGORIES_IN_BUSINESSCATEGORY_SORT = /^([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\/businesscategories\/sort$/
const { copyUploadTo } = useTusServer()


/**
 *
 * @api {post} /api/businesscategories/:id/templates （新建并）关联模板到指定业务分类
 * @apiName （新建并）关联模板到指定业务分类
 * @apiGroup businesscategories
 * @apiVersion  1.0.0
 *
 * @apiParam {Number} id 业务分类id
 *
 * @apiBody {String} id 模板id
 * @apiBody {String} name 模板名称
 * @apiBody {String} type 模板类型
 * @apiBody {String} format 模板格式
 *
 * @apiSuccess (200) {Object} template 模板对象
 * @apiSuccess (200) {Number} template.id 模板id
 * @apiSuccess (200) {String} template.name 模板名称
 * @apiSuccess (200) {String} template.type 模板类型
 * @apiSuccess (200) {String} template.format 模板格式
 * @apiSuccess (200) {Date} template.createdAt createdAt
 * @apiSuccess (200) {Date} template.updatedAt updatedAt
 * @apiSuccess (200) {Number} template.version version
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
const postTemplateInBusinessCategory = async (event: { node: { res: ServerResponse<IncomingMessage> }, context: { prisma: PrismaClient } }, bcId: string, item: Template) => {
  // ※新添加模板必须与业务分类绑定
  // if (!tplId) {
  //   throw new Error('未指定业务分类id')
  // }
  try {
    const created = await event.context.prisma.$transaction(async prisma => {
      // 序号从0开始累加，新序号==件数
      const newOrdinal = await prisma.bcTplRel.count({
        where: {
          bcId: bcId
        }
      })
      console.log('newOrdinal', newOrdinal)

      if (item.id) {
        // 若 模板已存在，则 关联到指定业务分类
        await prisma.bcTplRel.create({
          data: {
            bcId: bcId,
            tplId: item.id,
            ordinal: newOrdinal,
            version: 0
          }
        })
        return await prisma.template.findUnique({
          where: {
            id: item.id
          }
        })
      } else {
        // 若 模板不存在，则 新建模板并关联到指定业务分类
        const dataForCreate = pick(item, ['name', 'path'])
        const path = copyUploadTo(dataForCreate.path, process.env.TEMPLATE_PATH ?? '/templates')
        if (!path) {
          event.node.res.statusCode = 400
          // event.node.res.end()
          return
        }
        dataForCreate.path = path
        const id = uuid()
        return await prisma.template.create({
          data: {
            id: id,
            ...dataForCreate,
            version: 0,
            businessCategories: {
              create: {
                ordinal: newOrdinal,
                version: 0,
                businessCategory: {
                  connect: {
                    id: bcId
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
 * @api {post} /api/businesscategories/:id/templates/sort 对关联指定业务分类的模板排序
 * @apiName 对关联指定业务分类的模板排序
 * @apiGroup businesscategories
 * @apiVersion  1.0.0
 *
 * @apiParam {Number} id 业务分类id
 *
 * @apiBody {Object[]} template 模板数组
 * @apiBody {String} template.id 模板id
 * @apiBody {Number} template.ordinal 序号
 * @apiBody {Number} template.version version
 *
 * @apiParamExample  {json} Request-Example:
 * [
 *   {
 *     bcId: "1", id: "1", ordinal: 1, version: 0
 *   },
 *   {
 *     bcId: "1", id: "2", ordinal: 0, version: 0
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
const postTemplatesInBusinessCategorySort = async (event: { node: { res: ServerResponse<IncomingMessage> }, context: { prisma: PrismaClient } }, bcId: string, items: TemplateSort[]) => {
  if (!Array.isArray(items) || items.length == 0) {
    event.node.res.statusCode = 400
    return
  }
  const executed = await event.context.prisma.$transaction(async prisma => {
    for (const item of items) {
      await prisma.bcTplRel.update({
        where: {
          bcId_tplId: {
            bcId: bcId,
            tplId: item.id
          },
          template: {
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
 * @api {post} /api/businesscategories/:id/templates （新建并）关联模板到指定业务分类
 * @apiName （新建并）关联模板到指定业务分类
 * @apiGroup businesscategories
 * @apiVersion  1.0.0
 *
 * @apiParam {Number} id 业务分类id
 *
 * @apiBody {String} id 模板id
 * @apiBody {String} name 模板名称
 * @apiBody {String} type 模板类型
 * @apiBody {String} format 模板格式
 *
 * @apiSuccess (200) {Object} template 模板对象
 * @apiSuccess (200) {Number} template.id 模板id
 * @apiSuccess (200) {String} template.name 模板名称
 * @apiSuccess (200) {String} template.type 模板类型
 * @apiSuccess (200) {String} template.format 模板格式
 * @apiSuccess (200) {Date} template.createdAt createdAt
 * @apiSuccess (200) {Date} template.updatedAt updatedAt
 * @apiSuccess (200) {Number} template.version version
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
const postBusinessCategoryInBusinessCategory = async (event: { node: { res: ServerResponse<IncomingMessage> }, context: { prisma: PrismaClient } }, pid: string, item: BusinessCategory) => {
  try {
    const whereClause: Prisma.BusinessCategoryWhereInput = {}
    if (pid === process.env.DUMMY_ROOT_ID) {
      whereClause.parent = {
        is: null
      }
    } else {
      whereClause.pid = pid
    }
    const created = await event.context.prisma.$transaction(async prisma => {
      // 序号从0开始累加，新序号==件数
      const newOrdinal = await prisma.businessCategory.count({
        where: whereClause
      })
      const dataForCreate = pick(item, [ 'pid', 'name', 'icon' ])
      return await prisma.businessCategory.create({
        data: {
          id: uuid(),
          ...dataForCreate,
          ordinal: newOrdinal,
          createdAt: new Date(),
          version: 0
        }
      })
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
 * @api {post} /api/businesscategories/:id/businesscategories/sort 对关联指定业务分类的业务分类排序
 * @apiName 对关联指定业务分类的业务分类排序
 * @apiGroup businesscategories
 * @apiVersion  1.0.0
 *
 * @apiParam {Number} id 业务分类id
 *
 * @apiBody {Object[]} businessCategory 业务分类数组
 * @apiBody {String} businessCategory.id 业务分类id
 * @apiBody {Number} businessCategory.ordinal 序号
 * @apiBody {Number} businessCategory.version version
 *
 * @apiParamExample  {json} Request-Example:
 * [
 *   {
 *     pid: "1", id: "1", ordinal: 1, version: 0
 *   },
 *   {
 *     pid: "1", id: "2", ordinal: 0, version: 0
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
const postBusinessCategoriesInBusinessCategorySort = async (event: { node: { res: ServerResponse<IncomingMessage> }, context: { prisma: PrismaClient } }, pid: string, items: BusinessCategory[]) => {
  if (!Array.isArray(items) || items.length == 0) {
    event.node.res.statusCode = 400
    return
  }
  const executed = await event.context.prisma.$transaction(async prisma => {
    for (const item of items) {
      await prisma.businessCategory.update({
        where: {
          pid: pid,
          id: item.id,
          version: item.version
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
type TemplateSort = Pick<Template, 'id' | 'version'> & { ordinal: number }
export default defineEventHandler(async event => {
  const params = event.context.params?.id
  if (params) {
    if (REGEX_TEMPLATES_IN_BUSINESSCATEGORIES_POST.test(params)) {
      // POST /api/businesscategories/:id/templates
      const bcId = params.replace(REGEX_TEMPLATES_IN_BUSINESSCATEGORIES_POST, "$1")
      const item = await readBody<Template>(event)
      return await postTemplateInBusinessCategory(event, bcId, item)
    } else if (REGEX_TEMPLATES_IN_BUSINESSCATEGORIES_SORT.test(params)) {
      // POST /api/businesscategories/:id/templates/sort
      const bcId = params.replace(REGEX_TEMPLATES_IN_BUSINESSCATEGORIES_SORT, "$1")
      const items = await readBody<TemplateSort[]>(event)
      return await postTemplatesInBusinessCategorySort(event, bcId, items)
    } else if (REGEX_BUSINESSCATEGORIES_IN_BUSINESSCATEGORIES_POST.test(params)) {
      // POST /api/businesscategories/:id/businesscategories
      const pid = params.replace(REGEX_BUSINESSCATEGORIES_IN_BUSINESSCATEGORIES_POST, "$1")
      const item = await readBody<BusinessCategory>(event)
      return await postBusinessCategoryInBusinessCategory(event, pid, item)
    } else if (REGEX_BUSINESSCATEGORIES_IN_BUSINESSCATEGORY_SORT.test(params)) {
      // POST /api/businesscategories/:id/businesscategories/sort
      const pid = params.replace(REGEX_BUSINESSCATEGORIES_IN_BUSINESSCATEGORY_SORT, "$1")
      const items = await readBody<BusinessCategory[]>(event)
      return await postBusinessCategoriesInBusinessCategorySort(event, pid, items)
    }
  }
})
