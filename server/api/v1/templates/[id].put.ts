import { Template } from "@prisma/client"
import { isEmpty, pick } from "lodash-es"
const { copyUploadTo } = useTusServer()

/**
 *
 * @api {put} /api/templates/:id 更新模板
 * @apiName 更新模板
 * @apiGroup templates
 * @apiVersion  1.0.0
 *
 *
 * @apiParam  {String} id 模板id
 *
 * @apiSuccess (200) {Object} template 模板对象
 * @apiSuccess (200) {Number} template.id 模板id
 * @apiSuccess (200) {String} template.name 模板名称
 * @apiSuccess (200) {String} template.path 模板路径
 * @apiSuccess (200) {Date} template.createdAt createdAt
 * @apiSuccess (200) {Date} template.updatedAt updatedAt
 * @apiSuccess (200) {Number} template.version version
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
  const dataForUpdate = await readBody<Template>(event)
  if (isEmpty(dataForUpdate)) {
    event.node.res.statusCode = 400
    return
  }
  if (dataForUpdate.path) {
    const path = copyUploadTo(dataForUpdate.path, process.env.TEMPLATE_PATH ?? '/templates')
    path && (dataForUpdate.path = path)
  }

  const modified = await event.context.prisma.template.update({
    where: {
      id: dataForUpdate.id,
      version: dataForUpdate.version
    },
    data: {
      ...pick(dataForUpdate, isEmpty(dataForUpdate.path) ? ['name'] : [ 'name', 'path' ]),
      updatedAt: new Date(),
      version: {
        increment: 1
      }
    }
  })
  return modified
})
