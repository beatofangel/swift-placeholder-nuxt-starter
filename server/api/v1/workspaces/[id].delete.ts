import { getServerSession } from "#auth"
import { PrismaClient } from "@prisma/client"
import { SessionWrapper } from "index"

const deleteWorkspace = async (event: { context: { prisma: PrismaClient } }, userId: string, id: string) => {
  return event.context.prisma.workspace.delete({
    where: {
      id: id,
      owner: userId
    }
  })
}
export default defineEventHandler(async event => {
  const session = await getServerSession(event)
  if (!session) throw createError({ statusMessage: 'Unauthenticated', statusCode: 401 })
  const id = event.context.params!.id
  const uid = (session as SessionWrapper).uid
  return await deleteWorkspace(event, uid, id)
})
