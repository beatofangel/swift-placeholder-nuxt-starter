import { Prisma } from "@prisma/client"
import { Result } from "server/utils/http";
import { pick } from "lodash-es";

type PlaceholderItemPartial = 'name' | 'type' | 'format'

export default defineEventHandler(async event => {
  // const query = getQuery(event)
  // console.log(query)
  // const queryItems = pick(query, ['name', 'type', 'format'])
  // const queryOrders = query.orderBy ? pick(JSON.parse(query.orderBy as string), ['name', 'type', 'format']) : {}
  // const whereClause: Prisma.PlaceholderItemWhereInput = {}
  // Object.entries(queryItems).forEach(([key, value]) => {
  //   const column = key as PlaceholderItemPartial
  //   whereClause[column] = JSON.parse(value as string) as Prisma.StringFilter<"PlaceholderItem"> | string
  // })
  // console.log(whereClause)
  // const orderByClause: Prisma.PlaceholderItemOrderByWithRelationAndSearchRelevanceInput = {}
  // Object.entries(queryOrders).forEach(([key, value]) => {
  //   const column = key as PlaceholderItemPartial
  //   orderByClause[column] = value as Prisma.SortOrder & (Prisma.SortOrder | Prisma.SortOrderInput)
  // })
  // console.log(orderByClause)

  // const data = await event.context.prisma.placeholderItem.findMany({
  //   where: whereClause,
  //   orderBy: orderByClause
  // })

  // return data
})
