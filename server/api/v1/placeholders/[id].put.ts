import { PlaceholderItem } from "@prisma/client"
import { isEmpty, pick } from "lodash-es"
import { Result } from "server/utils/http"

/**
 *
 * @api {put} /api/placeholders/:id 更新占位符
 * @apiName 更新占位符
 * @apiGroup placeholders
 * @apiVersion  1.0.0
 *
 *
 * @apiParam  {String} id 占位符id
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
 * {
 *     id : "123",
 *     name: "name123",
 *     type: "text",
 *     format: "",
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
  const item = await readBody<PlaceholderItem>(event)
  if (isEmpty(item)) {
    event.node.res.statusCode = 400
    return
  }
  const modified = await event.context.prisma.placeholderItem.update({
    where: {
      id: item.id,
      version: item.version
    },
    data: {
      ...pick(item, [ /* 'name', */ 'type', 'format' ]), // 名称不可修改
      updatedAt: new Date(),
      version: {
        increment: 1
      }
    }
  })
  return modified
})
