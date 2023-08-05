/**
 *
 * @api {get} /api/businesscategories/cascaded 级联获取业务分类
 * @apiName 级联获取业务分类
 * @apiGroup businesscategories
 * @apiVersion  1.0.0
 *
 *
 * @apiSuccess (200) {Object} businessCategory[] 业务分类数组
 *
 * @apiSuccessExample {Object} Success-Response:
 * [
 *   {
 *     children: [],
 *     createdAt: "2023-07-29T07:16:33.667Z",
 *     icon: "mdi-ab-testing"
 *     id: "6ac0bd6a-c603-4b60-8ec4-4c4eb58da424"
 *     name: "大分类1"
 *     ordinal: 0
 *     pid: null
 *     updatedAt: "2023-07-29T07:16:33.667Z"
 *     version: 0
 *   },
 *   ...
 * ]
 *
 *
 */
export default defineEventHandler(async event => {
  return await event.context.prisma.businessCategory.findMany({
    include: {
      children: {
        include: {
          children: {
            orderBy: {
              ordinal: "asc"
            }
          },
        },
        orderBy: {
          ordinal: "asc"
        }
      }
    },
    where: {
      parent: {
        is: null
      }
    },
    orderBy: {
      ordinal: "asc"
    }
  })
})
