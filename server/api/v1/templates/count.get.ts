import { PlaceholderItem, Prisma } from "@prisma/client"
import { pick } from "lodash-es"

/**
 *
 * @api {get} /api/templates/count 获取模板件数
 * @apiName 获取模板件数
 * @apiGroup templates
 * @apiVersion  1.0.0
 *
 *
 * @apiQuery  {Json} [name] 模板名称条件
 * @apiQuery  {Json} [businessCategories] 关联业务分类条件
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
  const query = pick(getQuery(event), ['name', 'businessCategories', 'placeholderItems'])
  const whereClause: Prisma.TemplateWhereInput = {}
  Object.entries(query).forEach(([key, value]) => {
    const column = key as 'name' | 'businessCategories' | 'placeholderItems'
    whereClause[column] = JSON.parse(value as string) as Prisma.StringFilter<"Template"> | string
  })
  return await event.context.prisma.template.count({
    where: whereClause
  })
})
