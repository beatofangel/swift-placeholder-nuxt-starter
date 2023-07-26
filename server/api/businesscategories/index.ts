import { BusinessCategory, Prisma } from "@prisma/client"
import { EditMode } from "@/composables/dialog";
import { isArray, isEmpty, keyBy, pick } from "lodash-es";
import { v4 as uuid } from "uuid";
import { Result } from "server/utils/http";
import { HTTPMethod } from "index";

type BusinessCategoryWithOp = BusinessCategory & { mode: EditMode }

export default defineEventHandler(async event => {
  const methods: Record<HTTPMethod, Function> = {
    async GET() {
      const query = getQuery(event)
      if (query.cascaded === 'true') {
        // get select options
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
      } else if (query.count === 'true') {
        const whereClause: Prisma.BusinessCategoryWhereInput = {}
        const conditions = pick(query, ['id', 'pid', 'name', 'icon'])
        Object.keys(conditions).forEach((val) => {
          const val2 = val as keyof BusinessCategory
          whereClause[val2] = query[val2] as string
        })
        return await event.context.prisma.businessCategory.count({
          where: whereClause
        })
      } else {
        // get list
        // where
        const whereClause: Prisma.BusinessCategoryWhereInput = {}
        if (isEmpty(query.pid)) {
          whereClause.parent = {
            is: null
          }
        } else {
          whereClause.pid = query.pid as string
        }
        // orderby
        const orderByClause: Prisma.Enumerable<Prisma.BusinessCategoryOrderByWithRelationInput> = { ordinal: 'asc' }
        if (query.order) {
          orderByClause.ordinal = ['asc', 'desc'].includes(query.order as Prisma.SortOrder) ? query.order as Prisma.SortOrder : 'asc'
        }
        return await event.context.prisma.businessCategory.findMany({
          where: whereClause,
          orderBy: orderByClause
        })
      }
    },
    async POST() {
      const result: Result = { success: false }
      const data = await readBody(event)
      if (isArray(data)) {
        // 排序
        const arrayData: BusinessCategoryWithOp[] = data
        if (arrayData.length == 0) return []
        const executed = await event.context.prisma.$transaction(async prisma => {
          const result = []
          for (const o of arrayData) {
            switch (o.mode) {
              case EditMode.Update:
                const upd = await event.context.prisma.businessCategory.update({
                  where: {
                    id: o.id,
                    version: o.version
                  },
                  data: {
                    ...pick(o, [ 'name', 'icon', 'ordinal' ]),
                    updatedAt: new Date(),
                    version: {
                      increment: 1
                    }
                  }
                })
                result.push(upd)
                break
              case EditMode.Delete:
                const del = await event.context.prisma.businessCategory.delete({
                  where: {
                    id: o.id,
                    version: o.version
                  }
                })
                result.push(del)
                break
              default:
                // illegal case, nothing to do
            }
          }
          return result
        })
        console.log('execute:', executed)
        return executed
      } else {
        // 单条数据新增
        const whereClause: Prisma.BusinessCategoryWhereInput = {}
        const singleData: BusinessCategoryWithOp = data
        if (isEmpty(data.pid)) {
          whereClause.parent = {
            is: null
          }
        } else {
          whereClause.pid = singleData.pid as string
        }
        try {
          const created = await event.context.prisma.$transaction(async prisma => {
            // ordinal start with 0, so new ordinal equals the COUNT
            const newOrdinal = await prisma.businessCategory.count({
              where: whereClause
            })
            const dataForCreate = pick(singleData, [ 'pid', 'name', 'icon' ])
            return await prisma.businessCategory.create({
              data: {
                id: uuid(),
                ...dataForCreate,
                ordinal: newOrdinal,
                createdAt: new Date(),
                version: 0
              }
            }).catch(e => {
              console.log(e)
              throw e
            })
          })
          result.data = created
          result.success = true
        } catch(e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            result.success = false
            result.errorMessage = `存在唯一约束冲突，无法使用名称<${singleData.name}>`
          } else {
            throw e
          }
        }
        return result
      }
    },
    async PUT() {
      const data = await readBody(event)
      // if (isArray(data)) {
        // 暂无此场景
        // const arrayData: BusinessCategory[] = data
        // if (arrayData.length == 0) return []
        // const updates = []
        // for (const o of arrayData) {
        //   const upd = event.context.prisma.businessCategory.update({
        //     where: {
        //       id: o.id,
        //       version: o.version
        //     },
        //     data: {
        //       ...pick(o, [ 'name', 'icon', 'ordinal' ]),
        //       updatedAt: new Date(),
        //       version: {
        //         increment: 1
        //       }
        //     }
        //   })
        //   updates.push(upd)
        // }
        // const modified = await event.context.prisma.$transaction(updates)
        // return modified
      // } else {
        // 单条数据更新
        if (isEmpty(data)) return null
        const singleData: BusinessCategory = data
        const modified = event.context.prisma.businessCategory.update({
          where: {
            id: singleData.id,
            version: singleData.version
          },
          data: {
            ...pick(singleData, [ 'name', 'icon', 'ordinal' ]),
            updatedAt: new Date(),
            version: {
              increment: 1
            }
          }
        })
        console.log('update:', modified)
        return modified
      // }
    },
    async DELETE() {
      // 单条数据删除
      const data = await readBody<BusinessCategoryWithOp>(event)
      const deleted = await event.context.prisma.businessCategory.delete({
        where: {
          id: data.id,
          version: data.version
        }
      })
      console.log('delete:', deleted)
      return deleted
    }
  }
  const method = methods[getMethod(event)]
  return method && (method())
})
