import { Prisma } from "@prisma/client"
import { HTTPMethod } from "index"

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
      } else {
        // get list
        // where
        const whereClause: Prisma.BusinessCategoryWhereInput = {}
        if (query.pid == null) return []
        if (query.pid === '') {
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
    // async POST() {
    //   const { data } = await readBody(event)
    //   return await event.context.prisma.workspace.create({
    //     data: {
    //       type: 'REPLACEMENT',
    //       owner: username,
    //       data: Array.isArray(data) ? data : [data]
    //     }
    //   })
    // }
  }
  const method = methods[getMethod(event)]
  return method && (method())
})
