// import { PlaceholderItemWithOp } from "./index.post"
import { Result } from "server/utils/http"
import { pick } from "lodash-es"

export default defineEventHandler(async event => {
  // const result: Result = { success: false }
  // const items = await readBody<PlaceholderItemWithOp[]>(event)
  // if (!Array.isArray(items) || items.length == 0) return result
  // const executed = await event.context.prisma.$transaction(async prisma => {
  //   for (const item of items) {
  //     await prisma.tplPhItmRel.update({
  //       where: {
  //         tplId_phItmId: {
  //           tplId: item.tplId as string,
  //           phItmId: item.id
  //         },
  //         placeholderItem: {
  //           version: item.version
  //         }
  //       },
  //       data: {
  //         ...pick(item, [ 'ordinal' ]),
  //         updatedAt: new Date(),
  //         version: {
  //           increment: 1
  //         }
  //       }
  //     })
  //   }
  //   return true
  // })
  // result.success = true
  // result.data = executed
  // return result
})
