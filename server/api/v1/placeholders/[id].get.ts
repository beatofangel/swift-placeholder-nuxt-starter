import { Prisma } from "@prisma/client"
import { Result } from "server/utils/http";

export default defineEventHandler(async event => {
  const result: Result = { success: false }
  const id = event.context.params?.id
  const whereClause: Prisma.PlaceholderItemWhereInput = {}
  if (id) {
    whereClause.id = id
  }
  console.log(whereClause)

  const data = await event.context.prisma.placeholderItem.findMany({
    where: whereClause
  })
  result.data = data
  result.success = true

  return result
})
