import { BusinessCategory, Prisma, PrismaClient, Template } from "@prisma/client"
import { IncomingMessage, ServerResponse } from "http";

const REGEX_TEMPLATES_IN_BUSINESSCATEGORY_DELETE = /^([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\/templates\/([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})$/
const REGEX_BUSINESSCATEGORY_IN_BUSINESSCATEGORY_DELETE = /^([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\/businesscategories\/([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})$/

/**
 *
 * @api {delete} /api/businesscategories/:id/templates/:tplid （删除并）解除模板与指定业务分类的关联
 * @apiName （删除并）解除模板与指定业务分类的关联
 * @apiGroup businesscategories
 * @apiVersion  1.0.0
 *
 * @apiParam  {String} id 业务分类id
 * @apiParam  {String} tplid 模板id
 *
 * @apiBody {Object} template 模板对象
 * @apiBody {Number} template.version version
 *
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
 */
const deleteTemplateInBusinessCategory = async (event: { node: { res: ServerResponse<IncomingMessage> }, context: { prisma: PrismaClient } }, bcId: string, id: string,  version: number) => {
  const deleted = await event.context.prisma.$transaction(async prisma => {
    // 获取与待删除模板关联的业务分类数量
    const whereClause: Prisma.BcTplRelWhereInput = {
      tplId: id,
      bcId: {
        not: bcId
      }
    }
    const count = await prisma.bcTplRel.count({
      where: whereClause
    })

    let del
    let delRel
    if (count > 0) {
      // 待删除模板已与其他业务分类关联，断开待删除模板与业务分类关联
      delRel = await prisma.bcTplRel.delete({
        where: {
          bcId_tplId: {
            bcId: bcId,
            tplId: id
          }
        }
      })
      // 获取待删除模板（※与其他业务分类关联，因此不会被删除）
      del = await prisma.template.findUnique({
        where: {
          id: id
        }
      })
    } else {
      // 获取待删除模板关联
      delRel = await prisma.bcTplRel.findUnique({
        where: {
          bcId_tplId: {
            bcId: bcId,
            tplId: id
          }
        }
      })
      // 删除模板(onDelete: Cascade)
      del = await prisma.template.delete({
        where: {
          id: id,
          version: version
        }
      })
    }

    // 更新模板序号（序号大于待删除模板） ※未与业务分类绑定的模板无需更新
    delRel && await prisma.bcTplRel.updateMany({
      data: {
        ordinal: {
          increment: -1
        },
        version: {
          increment: 1
        }
      },
      where: {
        bcId: bcId,
        ordinal: {
          gt: delRel.ordinal
        }
      }
    })

    return del
  })
  return deleted
}

/**
 *
 * @api {delete} /api/businesscategories/:pid/businesscategories/:id 删除父业务分类下的指定业务分类（※所有下属业务分类将全部删除，并解除与模板的关联）
 * @apiName 删除父业务分类下的指定业务分类
 * @apiGroup businesscategories
 * @apiVersion  1.0.0
 *
 * @apiParam  {String} pid 父业务分类id
 * @apiParam  {String} id 业务分类id
 *
 * @apiBody {Object} businessCategory 业务分类对象
 * @apiBody {Number} businessCategory.version version
 *
 *
 * @apiSuccess (200) {Object} businessCategory 业务分类对象
 * @apiSuccess (200) {Number} businessCategory.pid pid
 * @apiSuccess (200) {Number} businessCategory.id id
 * @apiSuccess (200) {String} businessCategory.name 名称
 * @apiSuccess (200) {String} businessCategory.icon 图标
 * @apiSuccess (200) {Date} businessCategory.createdAt createdAt
 * @apiSuccess (200) {Date} businessCategory.updatedAt updatedAt
 * @apiSuccess (200) {Number} businessCategory.version version
 *
 * @apiSuccessExample Success-Response:
 * {
 *     pid: "1"
 *     id : "123",
 *     name: "name123",
 *     icon: "mdi-icon",
 *     createAt: Date,
 *     updateAt: Date,
 *     version: 1
 * }
 *
 */
const deleteBusinessCategoryInBusinessCategory = async (event: { node: { res: ServerResponse<IncomingMessage> }, context: { prisma: PrismaClient } }, pid: string, id: string, version: number) => {
  const whereClause: Prisma.BusinessCategoryWhereUniqueInput = {
    id: id,
    version: version
  }
  if (pid === process.env.DUMMY_ROOT_ID) {
    whereClause.parent = {
      is: null
    }
  } else {
    whereClause.pid = pid
  }
  const deleted = await event.context.prisma.$transaction(async prisma => {
    // 删除业务分类(onDelete: Cascade)
    const del = await prisma.businessCategory.delete({
      where: whereClause
    })

    // 更新业务分类（序号大于待删除业务分类）
    del && await prisma.businessCategory.updateMany({
      data: {
        ordinal: {
          increment: -1
        },
        version: {
          increment: 1
        }
      },
      where: {
        pid: pid,
        ordinal: {
          gt: del.ordinal
        }
      }
    })

    return del
  })
  return deleted
}

export default defineEventHandler(async event => {
  const params = event.context.params?.id
  if (params) {
    if (REGEX_TEMPLATES_IN_BUSINESSCATEGORY_DELETE.test(params)) {
      // DELETE /api/businesscategories/:id/templates/:tplid
      const [ _, bcId, id ] = params.match(REGEX_TEMPLATES_IN_BUSINESSCATEGORY_DELETE)!
      console.log(bcId, id)
      const { version } = await readBody<Template>(event)
      return await deleteTemplateInBusinessCategory(event, bcId, id, version)
    } else if (REGEX_BUSINESSCATEGORY_IN_BUSINESSCATEGORY_DELETE.test(params)) {
      // DELETE /api/businesscategories/:id/templates/:tplid
      const [ _, pid, id ] = params.match(REGEX_BUSINESSCATEGORY_IN_BUSINESSCATEGORY_DELETE)!
      console.log(pid, id)
      const { version } = await readBody<BusinessCategory>(event)
      return await deleteBusinessCategoryInBusinessCategory(event, pid, id, version)
    } else {
      event.node.res.statusCode = 400
      return
    }
  }
})
