import { Template, Prisma } from "@prisma/client"
import { EditMode } from "@/composables/dialog";
import { isArray, isEmpty, pick } from "lodash-es";
import { v4 as uuid } from "uuid";
import { Result } from "server/utils/http";
import { HTTPMethod } from "index";

type TemplateWithOp = Template & { bcId?: string, mode: EditMode }
const { copyUploadTo } = useTusServer()

export default defineEventHandler(async event => {
  const result: Result = { success: false }
  const methods: Record<HTTPMethod, Function> = {
    async GET() {
      const query = getQuery(event)
      if (query.count === 'true') {
        const whereClause: Prisma.TemplateWhereInput = {}
        const conditions = pick(query, ['id', 'name', 'path'])
        Object.keys(conditions).forEach((val) => {
          const val2 = val as keyof Template
          whereClause[val2] = query[val2] as string
        })
        result.data = await event.context.prisma.template.count({
          where: whereClause
        })
        result.success = true
        return result
      } else {
        // get list
        // where
        const whereClause: Prisma.BusinessCategoryWhereInput = {}
        if (!isEmpty(query.bcId)) {
          whereClause.id = query.bcId as string
        }
        // orderby
        const orderByClause: Prisma.Enumerable<Prisma.BcTplRelOrderByWithRelationInput> = { ordinal: 'asc' }
        if (query.order) {
          orderByClause.ordinal = ['asc', 'desc'].includes(query.order as Prisma.SortOrder) ? query.order as Prisma.SortOrder : 'asc'
        }
        const data = await event.context.prisma.businessCategory.findMany({
          select: {
            id: true,
            name: true,
            templates: {
              select: {
                ordinal: true,
                template: true
              },
              orderBy: orderByClause
            }
          },
          where: whereClause
        })
        console.log(data)
        result.data = data.flatMap(({ id: bcId, name: bcName, templates }) => templates.map(({ ordinal, template }) => ({ bcId, bcName, ordinal, ...template })))
        result.success = true
        return result
      }
    },
    async POST() {
      const data = await readBody(event)
      if (isArray(data)) {
        // 排序
        const arrayData: TemplateWithOp[] = data
        if (arrayData.length == 0) return result
        const delHandlers: Function[] = []
        const executed = await event.context.prisma.$transaction(async prisma => {
          const resultArray = []
          for (const o of arrayData) {
            switch (o.mode) {
              case EditMode.Update:
                const upd = await event.context.prisma.bcTplRel.update({
                  where: {
                    bcId_tplId: {
                      bcId: o.bcId!,
                      tplId: o.id
                    },
                    template: {
                      version: o.version
                    }
                  },
                  data: {
                    ...pick(o, ['ordinal']),
                    updatedAt: new Date(),
                    version: {
                      increment: 1
                    }
                  }
                })
                resultArray.push(upd)
                break
              case EditMode.Delete:
                const del = await event.context.prisma.template.delete({
                  where: {
                    id: o.id,
                    version: o.version
                  }
                })
                delHandlers.push(async () => {
                  return await useFetch(del.path, { method: 'DELETE' })
                })
                resultArray.push(del)
                break
              default:
              // illegal case, nothing to do
            }
          }
          return resultArray
        })
        console.log('execute:', executed)
        delHandlers.forEach(async handler => {
          const res = await handler()
          console.log(res)
        })
        result.success = true
        result.data = executed
        return result
      } else {
        // 单条数据新增
        const whereClause: Prisma.TemplateWhereInput = {}
        const singleData: TemplateWithOp = data
        if (isEmpty(data.bcId)) {
          result.errorMessage = '未指定业务分类id'
          return result
        }
        whereClause.businessCategories = {
          every: {
            bcId: data.bcId
          }
        }
        try {
          const created = await event.context.prisma.$transaction(async prisma => {
            // ordinal start with 0, so new ordinal equals the COUNT
            const newOrdinal = await prisma.template.count({
              where: whereClause
            })
            const dataForCreate = pick(singleData, ['name', 'path'])
            const path = copyUploadTo(dataForCreate.path, process.env.TEMPLATE_PATH ?? 'templates')
            if (!path) {
              result.errorMessage = '文档保存失败'
              return result
            }
            dataForCreate.path = path
            const id = uuid()
            return await prisma.template.create({
              data: {
                id: id,
                ...dataForCreate,
                createdAt: new Date(),
                version: 0,
                businessCategories: {
                  create: {
                    ordinal: newOrdinal,
                    createdAt: new Date(),
                    version: 0,
                    businessCategory: {
                      connect: {
                        id: data.bcId
                      }
                    }
                  }
                }
              }
            }).catch(e => {
              console.log(e)
              throw e
            })
          })
          result.data = created
          result.success = true
        } catch (e) {
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
      // const arrayData:  Template[] = data
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
      if (isEmpty(data)) return result
      const singleData: Template = data
      const modified = await event.context.prisma.template.update({
        where: {
          id: singleData.id,
          version: singleData.version
        },
        data: {
          ...pick(singleData, isEmpty(singleData.path) ? ['name'] : ['name', 'path']),
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
      const data = await readBody<TemplateWithOp>(event)
      const deleted = await event.context.prisma.template.delete({
        where: {
          id: data.id,
          version: data.version
        }
      })
      console.log('delete:', deleted)

      /**
       * Deleting a template in a web page should also delete the related document.
       *
       * == TODO ==
       * Documents that are no longer relevant to the template should be deleted daily by the crontab task.
       *
       */
      const headers = {
        'Tus-Resumable': '1.0.0',
        // TODO after deploying to server with ssl, it should be deleted.
        'X-Forwarded-Proto': 'http'
      }
      fetch(deleted.path, { method: 'DELETE', headers: headers }).then(({ status }) => {
        console.log(status)
      }).catch(error => {
        console.log(error)
      })
      result.success = true
      result.data = deleted
      return result
    }
  }
  const method = methods[getMethod(event)]
  return method && (method())
})
