import { PlaceholderItem, Prisma } from "@prisma/client"

/**
 *
 * @api {get} /api/templates/count 获取模板件数
 * @apiName 获取模板件数
 * @apiGroup templates
 * @apiVersion  1.0.0
 *
 *
 * @apiQuery  {Json} [id] 模板id条件
 * @apiQuery  {Json} [placeholderItems] 关联占位符条件
 *
 * @apiSuccess (200) {Number} count 模板件数
 *
 * @apiSuccessExample {Number} Success-Response:
 * 2
 *
 *
 */
export default defineEventHandler(async event => {
  const query = getQuery(event)
  const id = query.id ? JSON.parse(query.id as string) : null
  const placeholderItems = query.placeholderItems ? JSON.parse(query.placeholderItems as string) : null

  const whereClause: Prisma.TemplateWhereInput = {}
  id && (whereClause.id = id)
  placeholderItems && (whereClause.placeholderItems = placeholderItems)
  return await event.context.prisma.template.count({
    where: whereClause
  })
})
