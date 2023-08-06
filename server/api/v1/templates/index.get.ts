import { Prisma } from "@prisma/client"
import { pick } from "lodash-es"

/**
 *
 * @api {get} /api/templates  查询模板
 * @apiName 查询模板
 * @apiGroup templates
 * @apiVersion  1.0.0
 *
 * @apiQuery {Json} query 查询条件
 *
 * @apiSuccess (200) {Object} template 模板对象
 * @apiSuccess (200) {Number} template.id id
 * @apiSuccess (200) {String} template.name 名称
 * @apiSuccess (200) {String} template.type 路径
 * @apiSuccess (200) {Date} template.createdAt createdAt
 * @apiSuccess (200) {Date} template.updatedAt updatedAt
 * @apiSuccess (200) {Number} template.version version
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [
 *        {
 *          "id": "id";
 *          "name": "name";
 *          "type": "path";
 *          "createdAt": Date;
 *          "updatedAt": Date;
 *          "version": 0;
 *        },
 *        ...
 *      ]
 *
 */
export default defineEventHandler(async event => {
  // TODO 机制上过于freestyle，有安全风险
  const query = getQuery(event)
  // let whereClause: Prisma.TemplateWhereInput = {}
  // let selectClause: Prisma.TemplateSelect = {}
  // let includeClause: Prisma.TemplateInclude = {}
  // let orderByClause: Prisma.TemplateOrderByWithRelationAndSearchRelevanceInput = {}
  const args = {} as any
  Object.entries(query).forEach(([key, value]) => {
    try {
      args[key] = JSON.parse(value as string)
    } catch (e) {
      console.error(e)
    }
    // switch (key) {
    //   case 'where':
    //     try {
    //       // whereClause = pick(JSON.parse(value as string), ['name', 'path', 'businessCategories'])
    //       args[key] = JSON.parse(value as string)
    //     } catch (e) {
    //       console.error(e)
    //     }
    //     break;
    //   case 'select':
    //     try {
    //       selectClause = pick(JSON.parse(value as string), ['name', 'path', 'businessCategories'])
    //       args[key] = selectClause
    //     } catch (e) {
    //       console.error(e)
    //     }
    //     break;
    //   case 'include':
    //     try {
    //       includeClause = pick(JSON.parse(value as string), ['name', 'path', 'businessCategories'])
    //     } catch (e) {
    //       console.error(e)
    //     }
    //     break;
    //   case 'orderby':
    //     try {
    //       orderByClause = pick(JSON.parse(value as string), ['name', 'path', 'businessCategories'])
    //     } catch (e) {
    //       console.error(e)
    //     }
    //     break;
    //   default:
    //     // TODO
    // }
    // const column = key as 'name' | 'path' | 'businessCategories'
    // try {
    //   const cond = JSON.parse(value as string) as Prisma.StringFilter<"Template">
    //   whereClause[column] = cond
    // } catch (e) {
    //   whereClause[column] = value as string
    // }
  })
  const data = await event.context.prisma.template.findMany(args)
  return data
})
