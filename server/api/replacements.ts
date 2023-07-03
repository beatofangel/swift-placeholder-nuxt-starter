import { getServerSession } from "#auth"
import { HTTPMethod, SessionWrapper } from "index"


export default defineEventHandler(async event => {
  const session = await getServerSession(event)
  if (!session) throw createError({ statusMessage: 'Unauthenticated', statusCode: 401 })
  console.log(session)
  const username = (session as SessionWrapper).username
  const methods: Record<HTTPMethod, Function> = {
    async GET() {
      return await event.context.prisma.workspace.findFirst({
        where: { type: 'REPLACEMENT', owner: username }
      })
    },
    async POST() {
      const { data } = await readBody(event)
      return await event.context.prisma.workspace.create({
        data: {
          type: 'REPLACEMENT',
          owner: username,
          data: Array.isArray(data) ? data : [data]
        }
      })
    }
  }
  const method = methods[getMethod(event)]
  return method && (method())
})
