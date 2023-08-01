import { PlaceholderItem, Prisma } from "@prisma/client"
export default defineEventHandler(event => {
  const query = getQuery(event)
  const whereClause: Prisma.PlaceholderItemWhereInput = {}

  return 'count(placeholders): unimplemented'
})
