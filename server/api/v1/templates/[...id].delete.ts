import { PlaceholderItem, Prisma, PrismaClient } from "@prisma/client"
import { IncomingMessage, ServerResponse } from "http";
import { omit } from "lodash-es";

const REGEX_PLACEHOLDERS_IN_TEMPLATES_DELETE = /^([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\/placeholders\/([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})$/

/**
 *
 * @api {delete} /api/templates/:id/placeholders/:phitmid （删除并）解除占位符与指定模板的关联
 * @apiName （删除并）解除占位符与指定模板的关联
 * @apiGroup templates
 * @apiVersion  1.0.0
 *
 * @apiParam  {String} id 模板id
 * @apiParam  {String} phitmid 占位符id
 *
 * @apiBody {Object} placeholderItem 占位符对象
 * @apiBody {Number} placeholderItem.version version
 *
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
 */
const deletePlaceholdersInTemplates = async (event: { node: { res: ServerResponse<IncomingMessage> }, context: { prisma: PrismaClient } }, tplId: string, id: string,  version: number) => {
  const deleted = await event.context.prisma.$transaction(async prisma => {
    // 获取与待删除占位符关联的模板数量
    const whereClause: Prisma.TplPhItmRelWhereInput = {
      phItmId: id,
      tplId: {
        not: tplId
      }
    }
    const count = await prisma.tplPhItmRel.count({
      where: whereClause
    })

    let del
    let delRel
    if (count > 0) {
      // 待删除占位符已与其他模板关联，断开待删除占位符与模板关联
      delRel = await prisma.tplPhItmRel.delete({
        where: {
          tplId_phItmId: {
            tplId: tplId,
            phItmId: id
          }
        }
      })
      // 获取待删除占位符（※与其他模板关联，因此不会被删除）
      del = await prisma.placeholderItem.findUnique({
        where: {
          id: id
        }
      })
    } else {
      // 获取待删除占位符关联
      delRel = await prisma.tplPhItmRel.findUnique({
        where: {
          tplId_phItmId: {
            tplId: tplId,
            phItmId: id
          }
        }
      })
      // 删除占位符(onDelete: Cascade)
      del = await prisma.placeholderItem.delete({
        where: {
          id: id,
          version: version
        }
      })
    }

    // 更新占位符序号（序号大于待删除占位符） ※未与模板绑定的占位符无需更新
    delRel && await prisma.tplPhItmRel.updateMany({
      data: {
        ordinal: {
          increment: -1
        },
        version: {
          increment: 1
        }
      },
      where: {
        tplId: tplId,
        ordinal: {
          gt: delRel.ordinal
        }
      }
    })

    return count > 0 ? del : {...omit(del, ['id'])}
  })
  return deleted
}
export default defineEventHandler(async event => {
  const params = event.context.params?.id
  if (params) {
    if (REGEX_PLACEHOLDERS_IN_TEMPLATES_DELETE.test(params)) {
      // DELETE /api/templates/:id/placeholders/:phitmid
      const [ _, tplId, id ] = params.match(REGEX_PLACEHOLDERS_IN_TEMPLATES_DELETE)!
      console.log(tplId, id)
      const { version } = await readBody<PlaceholderItem>(event)
      return await deletePlaceholdersInTemplates(event, tplId, id, version)
    } else {
      event.node.res.statusCode = 400
      return
    }
  }
})
