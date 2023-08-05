import { BusinessCategory } from "@prisma/client"
import { isEmpty, pick } from "lodash-es"

/**
 *
 * @api {put} /api/businesscategories/:id 更新业务分类
 * @apiName 更新业务分类
 * @apiGroup businesscategories
 * @apiVersion  1.0.0
 *
 *
 * @apiParam  {String} id 业务分类id
 *
 * @apiSuccess (200) {Object} businessCategory 业务分类对象
 * @apiSuccess (200) {Number} businessCategory.id 业务分类id
 * @apiSuccess (200) {String} businessCategory.name 业务分类名称
 * @apiSuccess (200) {String} businessCategory.path 业务分类路径
 * @apiSuccess (200) {Date} businessCategory.createdAt createdAt
 * @apiSuccess (200) {Date} businessCategory.updatedAt updatedAt
 * @apiSuccess (200) {Number} businessCategory.version version
 *
 * @apiSuccessExample Success-Response:
 * {
 *     id : "123",
 *     name: "name123",
 *     path: "path/to/file",
 *     createAt: Date,
 *     updateAt: Date,
 *     version: 1
 * }
 *
 *
 */
export default defineEventHandler(async event => {
  const id = event.context.params?.id
  if (!id) {
    event.node.res.statusCode = 400
    return
  }
  const item = await readBody<BusinessCategory>(event)
  if (isEmpty(item)) {
    event.node.res.statusCode = 400
    return
  }
  const modified = await event.context.prisma.businessCategory.update({
    where: {
      id: item.id,
      version: item.version
    },
    data: {
      ...pick(item, [ 'name', 'icon' ]),
      updatedAt: new Date(),
      version: {
        increment: 1
      }
    }
  })
  return modified
})
