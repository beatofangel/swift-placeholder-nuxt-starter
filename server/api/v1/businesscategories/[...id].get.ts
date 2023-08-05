import { Prisma, PrismaClient } from "@prisma/client"
import { IncomingMessage, ServerResponse } from "http"

const REGEX_TEMPLATES_IN_BUSINESSCATEGORY_GET = /^([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\/templates$/
const REGEX_BUSINESSCATEGORIES_IN_BUSINESSCATEGORY_GET = /^([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\/businesscategories$/

/**
 *
 * @api {get} /api/businesscategories/:id/templates  查询所有与指定业务分类绑定的模板
 * @apiName 查询所有与指定业务分类绑定的模板
 * @apiGroup businesscategories
 * @apiVersion  1.0.0
 *
 * @apiParam {Number} id 业务分类id
 *
 * @apiSuccess (200) {Object[]} template 模板数组（包含序号以及业务分类id和业务分类名称）
 * @apiSuccess (200) {String} template.bcId 关联业务分类id
 * @apiSuccess (200) {String} template.bcName 关联业务分类名称
 * @apiSuccess (200) {Number} template.ordinal 序号
 * @apiSuccess (200) {Number} template.id 模板id
 * @apiSuccess (200) {String} template.name 模板名称
 * @apiSuccess (200) {String} template.path 模板路径
 * @apiSuccess (200) {Date} template.createdAt createdAt
 * @apiSuccess (200) {Date} template.updatedAt updatedAt
 * @apiSuccess (200) {Number} template.version version
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [
 *        {
 *          "bcId": "bcId",
 *          "bcName": "bcName",
 *          "ordinal": 0,
 *          "id": "id";
 *          "name": "name";
 *          "path": "path/to/file";
 *          "createdAt": Date;
 *          "updatedAt": Date;
 *          "version": 0;
 *        },
 *        ...
 *      ]
 *
 */
const getTemplatesInBusinessCategory = async (event: { node: { res: ServerResponse<IncomingMessage> }, context: { prisma: PrismaClient } }, bcId: string) => {
  const orderByClause: Prisma.Enumerable<Prisma.BcTplRelOrderByWithRelationAndSearchRelevanceInput> = { ordinal: 'asc' }
    const data = await event.context.prisma.businessCategory.findMany({
      select: {
        id: true,
        name: true,
        templates: {
          select: {
            ordinal: true,
            template: true
          },
          orderBy: orderByClause
        }
      },
      where: {
        id: bcId
      }
    })
    const flatResult = data.flatMap(({ id: bcId, name: bcName, templates }) => templates.map(({ ordinal, template }) => ({ bcId, bcName, ordinal, ...template })))

    return flatResult
}

/**
 *
 * @api {get} /api/businesscategories/:pid/businesscategories  查询所有与指定业务分类绑定的业务分类
 * @apiName 查询所有与指定业务分类绑定的业务分类
 * @apiGroup businesscategories
 * @apiVersion  1.0.0
 *
 * @apiParam {Number} pid 父业务分类id
 *
 * @apiSuccess (200) {Object[]} businessCategory 业务分类数组
 * @apiSuccess (200) {Number} businessCategory.pid 父业务分类id
 * @apiSuccess (200) {Number} businessCategory.id 业务分类id
 * @apiSuccess (200) {String} businessCategory.name 业务分类名称
 * @apiSuccess (200) {String} businessCategory.icon 业务分类图标
 * @apiSuccess (200) {Number} businessCategory.ordinal 序号
 * @apiSuccess (200) {Date} businessCategory.createdAt createdAt
 * @apiSuccess (200) {Date} businessCategory.updatedAt updatedAt
 * @apiSuccess (200) {Number} businessCategory.version version
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [
 *        {
 *          "pid": "1";
 *          "id": "2";
 *          "name": "name";
 *          "icon": "mdi-icon";
 *          "ordinal": 0,
 *          "createdAt": Date;
 *          "updatedAt": Date;
 *          "version": 0;
 *        },
 *        ...
 *      ]
 *
 */
const getBusinessCategoriesInBusinessCategory = async (event: { node: { res: ServerResponse<IncomingMessage> }, context: { prisma: PrismaClient } }, pid: string) => {
  const whereClause: Prisma.BusinessCategoryWhereInput = {}
  if (pid === process.env.DUMMY_ROOT_ID) {
    whereClause.parent = {
      is: null
    }
  } else {
    whereClause.pid = pid
  }
  const orderByClause: Prisma.Enumerable<Prisma.BusinessCategoryOrderByWithRelationAndSearchRelevanceInput> = { ordinal: 'asc' }
  const data = await event.context.prisma.businessCategory.findMany({
    where: whereClause,
    orderBy: orderByClause
  })

  return data
}

export default defineEventHandler(async event => {
  const params = event.context.params?.id
  if (params) {
    if (REGEX_TEMPLATES_IN_BUSINESSCATEGORY_GET.test(params)) {
      const bcId = params.replace(REGEX_TEMPLATES_IN_BUSINESSCATEGORY_GET, "$1")
      return await getTemplatesInBusinessCategory(event, bcId)
    } else if (REGEX_BUSINESSCATEGORIES_IN_BUSINESSCATEGORY_GET.test(params)) {
      const pid = params.replace(REGEX_BUSINESSCATEGORIES_IN_BUSINESSCATEGORY_GET, "$1")
      return await getBusinessCategoriesInBusinessCategory(event, pid)
    }
  }
})
