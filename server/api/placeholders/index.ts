import { PlaceholderItem, Prisma } from "@prisma/client"
import { EditMode } from "@/composables/dialog";
import { isArray, isEmpty, pick } from "lodash-es";
import { v4 as uuid } from "uuid";
import { Result } from "server/utils/http";
import { HTTPMethod } from "index";

type PlaceholderItemWithOp = PlaceholderItem & { tplId?: string, mode: EditMode }

export default defineEventHandler(async event => {
  const result: Result = { success: false }
  const methods: Record<HTTPMethod, Function> = {
    async GET() {
      const query = getQuery(event)
      if (query.count === 'true') {
        const whereClause: Prisma.PlaceholderItemWhereInput = {}
        const conditions = pick(query, ['id', 'name', 'path'])
        Object.keys(conditions).forEach((val) => {
          const val2 = val as keyof PlaceholderItem
          whereClause[val2] = query[val2] as string
        })
        result.data = await event.context.prisma.placeholderItem.count({
          where: whereClause
        })
        result.success = true
        return result
      } else {
        // get list
        // where
        const whereClause: Prisma.TemplateWhereInput = {}
        if (!isEmpty(query.tplId)) {
          whereClause.id = query.tplId as string
        }
        if (Array.isArray(query.name)) {
          const data = await event.context.prisma.placeholderItem.findMany({
            where: {
              name: {
                in: query.name as []
              }
            }
          })
          result.data = data
          result.success = true
        } else {
          // orderby
          const orderByClause: Prisma.Enumerable<Prisma.TplPhItmRelOrderByWithRelationAndSearchRelevanceInput> = { ordinal: 'asc' }
          if (query.order) {
            orderByClause.ordinal = ['asc', 'desc'].includes(query.order as Prisma.SortOrder) ? query.order as Prisma.SortOrder : 'asc'
          }
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
            where: whereClause
          })
          console.log(data)
          result.data = data.flatMap(({id: tplId, name: tplName, placeholderItems})=>placeholderItems.map(({ordinal, placeholderItem})=>({tplId, tplName, ordinal, ...placeholderItem})))
          result.success = true
        }
        return result
      }
    },
    async POST() {
      const data = await readBody(event)
      if (isArray(data)) {
        // 排序
        const arrayData: PlaceholderItemWithOp[] = data
        if (arrayData.length == 0) return result
        const executed = await event.context.prisma.$transaction(async prisma => {
          // const resultArray = []
          for (const o of arrayData) {
            switch (o.mode) {
              case EditMode.Update:
                const upd = await event.context.prisma.tplPhItmRel.update({
                  where: {
                    tplId_phItmId: {
                      tplId: o.tplId!,
                      phItmId: o.id
                    },
                    placeholderItem: {
                      version: o.version
                    }
                  },
                  data: {
                    ...pick(o, [ 'ordinal' ]),
                    updatedAt: new Date(),
                    version: {
                      increment: 1
                    }
                  }
                })
                // resultArray.push(upd)
                break
              case EditMode.Delete:
                const count = await prisma.tplPhItmRel.count({
                  where: {
                    tplId: o.id
                  }
                })

                if (count > 1) {
                  await prisma.tplPhItmRel.delete({
                    where: {
                      tplId_phItmId: {
                        tplId: o.tplId as string,
                        phItmId: o.id
                      }
                    }
                  })
                  // const del = await prisma.placeholderItem.findUnique({
                  //   where: {
                  //     id: o.id
                  //   }
                  // })
                  // resultArray.push(del)
                } else {
                  const del = await event.context.prisma.placeholderItem.delete({
                    where: {
                      id: o.id,
                      version: o.version
                    }
                  })
                  // resultArray.push(del)
                }
                break
              default:
                // illegal case, nothing to do
            }
          }
          return true
        })
        console.log('execute:', executed)
        result.success = true
        result.data = executed
        return result
      } else {
        // 单条数据新增
        const singleData: PlaceholderItemWithOp = data
        if (isEmpty(data.tplId)) {
          result.errorMessage = '未指定模板id'
          return result
        }
        console.log('whereClause.placeholderItems', data.tplId)
        try {
          const created = await event.context.prisma.$transaction(async prisma => {
            // ordinal start with 0, so new ordinal equals the COUNT
            const newOrdinal = await prisma.tplPhItmRel.count({
              where: {
                tplId: data.tplId
              }
            })
            console.log('newOrdinal', newOrdinal)
            const dataForCreate = pick(singleData, [ 'name', 'type', 'format' ])
            if (data.id) {
              // placeholderItem exists => bind to template
              await prisma.tplPhItmRel.create({
                data: {
                  tplId: data.tplId,
                  phItmId: data.id,
                  ordinal: newOrdinal,
                  createdAt: new Date(),
                  version: 0
                }
              }).catch(e => {
                console.log(e)
                throw e
              })
              return await prisma.placeholderItem.findUnique({
                where: {
                  id: data.id
                }
              }).catch(e => {
                console.log(e)
                throw e
              })
            } else {
              // placeholderItem not exist => save and bind to template
              const id = uuid()
              return await prisma.placeholderItem.create({
                data: {
                  id: id,
                  ...dataForCreate,
                  createdAt: new Date(),
                  version: 0,
                  templates: {
                    create: {
                      ordinal: newOrdinal,
                      createdAt: new Date(),
                      version: 0,
                      template: {
                        connect: {
                          id: data.tplId
                        }
                      }
                    }
                  }
                }
              }).catch(e => {
                console.log(e)
                throw e
              })
            }
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
    //   // if (isArray(data)) {
    //     // 暂无此场景
    //     // const arrayData:  Template[] = data
    //     // if (arrayData.length == 0) return []
    //     // const updates = []
    //     // for (const o of arrayData) {
    //     //   const upd = event.context.prisma.businessCategory.update({
    //     //     where: {
    //     //       id: o.id,
    //     //       version: o.version
    //     //     },
    //     //     data: {
    //     //       ...pick(o, [ 'name', 'icon', 'ordinal' ]),
    //     //       updatedAt: new Date(),
    //     //       version: {
    //     //         increment: 1
    //     //       }
    //     //     }
    //     //   })
    //     //   updates.push(upd)
    //     // }
    //     // const modified = await event.context.prisma.$transaction(updates)
    //     // return modified
    //   // } else {
        // 单条数据更新
        if (isEmpty(data)) return result
        const singleData: PlaceholderItem = data
        const modified = await event.context.prisma.placeholderItem.update({
          where: {
            id: singleData.id,
            version: singleData.version
          },
          data: {
            ...pick(singleData, [ /* 'name', */ 'type', 'format' ]), // 名称不可修改
            updatedAt: new Date(),
            version: {
              increment: 1
            }
          }
        })
        console.log('update:', modified)
        result.data = modified
        result.success = true
        return result
      // }
    },
    async DELETE() {
      // 单条数据删除
      const data = await readBody<PlaceholderItemWithOp>(event)

      try {
        const deleted = await event.context.prisma.$transaction(async prisma => {
          const count = await prisma.tplPhItmRel.count({
            where: {
              phItmId: data.id
            }
          })

          if (count > 1) {
            // 已被其他模板引用
            await prisma.tplPhItmRel.delete({
              where: {
                tplId_phItmId: {
                  tplId: data.tplId as string,
                  phItmId: data.id
                }
              }
            })
            return await prisma.placeholderItem.findUnique({
              where: {
                id: data.id
              }
            })
          } else {
            return await prisma.placeholderItem.delete({
              where: {
                id: data.id,
                version: data.version
              }
            })
          }
        })
        console.log('delete:', deleted)
        result.success = true
        result.data = deleted
      } catch(e) {
        throw e
      }
      return result
    }
  }
  const method = methods[getMethod(event)]
  return method && (method())
})
