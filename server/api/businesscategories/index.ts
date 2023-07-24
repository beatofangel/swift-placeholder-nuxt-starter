import { BusinessCategory, Prisma } from "@prisma/client"
import { HTTPMethod } from "index"
import { isEmpty, pick } from "lodash-es";
import { v4 as uuid } from "uuid";

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
      const data = await readBody<BusinessCategory>(event)
      const whereClause: Prisma.BusinessCategoryWhereInput = {}
      if (isEmpty(data.pid)) {
        whereClause.parent = {
          is: null
        }
      } else {
        whereClause.pid = data.pid as string
      }
      const newData = await event.context.prisma.$transaction(async prisma => {
        // ordinal start with 0, so new ordinal equals the COUNT
        const newOrdinal = await prisma.businessCategory.count({
          where: whereClause
        })
        const dataForCreate = pick(data, [ 'pid', 'name', 'icon' ])
        return await prisma.businessCategory.create({
          data: {
            id: uuid(),
            ...dataForCreate,
            ordinal: newOrdinal,
            createdAt: new Date(),
            version: 0
          }
        }).catch(reason => {
          console.log(reason)
          return null
        })
      })

      return newData
    }
  }
  const method = methods[getMethod(event)]
  return method && (method())
})
