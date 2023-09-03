import { getServerSession } from "#auth"
import { HTTPMethod, SessionWrapper } from "index"


export default defineEventHandler(async event => {
  const session = await getServerSession(event)
  if (!session) throw createError({ statusMessage: 'Unauthenticated', statusCode: 401 })
  const uid = (session as SessionWrapper).uid
  return await event.context.prisma.workspace.findMany({
    where: { type: 'REPLACEMENT', owner: uid },
    orderBy: {
      ordinal: 'asc'
    }
  })
})
