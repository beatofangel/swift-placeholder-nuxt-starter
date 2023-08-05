import { Prisma } from "@prisma/client"

/**
 *
 * @api {get} /api/placeholders  查询占位符
 * @apiName 查询占位符
 * @apiGroup placeholders
 * @apiVersion  1.0.0
 *
 * @apiQuery {Json} name 占位符名称
 * @apiQuery {Json} type 占位符类型
 * @apiQuery {Json} format 占位符格式
 * @apiQuery {Json} templates 模板关系条件
 *
 * @apiSuccess (200) {Object} placeholderItem 占位符对象
 * @apiSuccess (200) {Number} placeholderItem.id id
 * @apiSuccess (200) {String} placeholderItem.name 名称
 * @apiSuccess (200) {String} placeholderItem.type 类型
 * @apiSuccess (200) {String} placeholderItem.format 格式
 * @apiSuccess (200) {Date} placeholderItem.createdAt createdAt
 * @apiSuccess (200) {Date} placeholderItem.updatedAt updatedAt
 * @apiSuccess (200) {Number} placeholderItem.version version
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [
 *        {
 *          "id": "id";
 *          "name": "name";
 *          "type": "text";
 *          "format": "";
 *          "createdAt": Date;
 *          "updatedAt": Date;
 *          "version": 0;
 *        },
 *        ...
 *      ]
 *
 */
export default defineEventHandler(async event => {
  const query = getQuery(event)
  const whereClause: Prisma.PlaceholderItemWhereInput = {}
  Object.entries(query).forEach(([key, value]) => {
    const column = key as 'name' | 'type' | 'format' | 'templates'
    try {
      const cond = JSON.parse(value as string) as Prisma.StringFilter<"PlaceholderItem">
      whereClause[column] = cond
    } catch (e) {
      whereClause[column] = value as string
    }
  })
  const data = await event.context.prisma.placeholderItem.findMany({
    where: whereClause
  })
  return data
})
