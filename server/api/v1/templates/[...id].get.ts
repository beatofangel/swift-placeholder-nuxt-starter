import { Prisma } from "@prisma/client"

const REGEX = /^([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\/placeholders$/

/**
 *
 * @api {get} /api/templates/:id/placeholders  查询所有与指定模板绑定的占位符
 * @apiName 查询所有与指定模板绑定的占位符
 * @apiGroup templates
 * @apiVersion  1.0.0
 *
 * @apiParam {Number} id 模板id
 *
 * @apiSuccess (200) {Object[]} placeholderItem 占位符数组（包含序号以及模板id和模板名称）
 * @apiSuccess (200) {String} placeholderItem.tplId 关联模板id
 * @apiSuccess (200) {String} placeholderItem.tplName 关联模板名称
 * @apiSuccess (200) {Number} placeholderItem.ordinal 序号
 * @apiSuccess (200) {Number} placeholderItem.id 占位符id
 * @apiSuccess (200) {String} placeholderItem.name 占位符名称
 * @apiSuccess (200) {String} placeholderItem.type 占位符类型
 * @apiSuccess (200) {String} placeholderItem.format 占位符格式
 * @apiSuccess (200) {Date} placeholderItem.createdAt createdAt
 * @apiSuccess (200) {Date} placeholderItem.updatedAt updatedAt
 * @apiSuccess (200) {Number} placeholderItem.version version
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      [
 *        {
 *          "tplId": "tplId",
 *          "tplName": "tplName",
 *          "ordinal": 0,
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
  const params = event.context.params?.id
  if (params && REGEX.test(params)) {
    const tplId = params.replace(REGEX, "$1")
    // TODO 暂不支持排序
    // const query = getQuery(event)
    // console.log(query)
    const orderByClause: Prisma.Enumerable<Prisma.TplPhItmRelOrderByWithRelationAndSearchRelevanceInput> = { ordinal: 'asc' }

    // let column = 'ordinal'
    // let order = 'asc'
    // // ?orderby=ordinal+asc
    // if (query.orderby) {
    //   const orderBy = (query.orderby as string).split('+')
    //   if (orderBy.length == 1) {
    //     column = orderBy[0].toLowerCase()
    //   } else if (orderBy.length == 2) {
    //     column = orderBy[0].toLowerCase()
    //     order = orderBy[1].toLowerCase()
    //   } else {
    //     return
    //   }

    //   if ('ordinal' === column && ['asc', 'desc'].includes(order)) {
    //     orderByClause[column] = order as Prisma.SortOrder
    //   }
    // }
    const data = await event.context.prisma.template.findMany({
      select: {
        id: true,
        name: true,
        placeholderItems: {
          select: {
            ordinal: true,
            placeholderItem: true
          },
          orderBy: orderByClause
        }
      },
      where: {
        id: tplId
      }
    })
    const flatResult = data.flatMap(({ id: tplId, name: tplName, placeholderItems }) => placeholderItems.map(({ ordinal, placeholderItem }) => ({ tplId, tplName, ordinal, ...placeholderItem })))

    return flatResult
  }
})
