import { PlaceholderItem, Prisma } from "@prisma/client"
import { pick } from "lodash-es"

/**
 *
 * @api {get} /api/businesscategories/count 获取业务分类件数
 * @apiName 获取业务分类件数
 * @apiGroup templates
 * @apiVersion  1.0.0
 *
 *
 * @apiQuery  {Json} [pid] 父业务分类id
 * @apiQuery  {Json} [name] 业务分类名称
 * @apiQuery  {Json} [templates] 关联模板条件
 *
 * @apiSuccess (200) {Number} count 业务分类件数
 *
 * @apiSuccessExample {Number} Success-Response:
 * 2
 *
 *
 */
export default defineEventHandler(async event => {
  const query = pick(getQuery(event), ['pid', 'name', 'templates'])
  const whereClause: Prisma.BusinessCategoryWhereInput = {}
  Object.entries(query).forEach(([key, value]) => {
    const column = key as 'pid' | 'name' | 'templates'
    whereClause[column] = JSON.parse(value as string) as Prisma.StringFilter<"BusinessCategory"> | string
  })
  return await event.context.prisma.businessCategory.count({
    where: whereClause
  })
})
