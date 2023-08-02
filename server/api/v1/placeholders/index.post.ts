import { PlaceholderItem, Prisma } from "@prisma/client"
import { Result } from "server/utils/http"
import { EditMode } from "@/composables/dialog";
import { pick } from "lodash-es";
import { v4 as uuid } from "uuid"

// export type PlaceholderItemWithOp = PlaceholderItem & { tplId?: string, mode: EditMode }

export default defineEventHandler(async event => {
  // const result: Result = { success: false }
  // const data = await readBody(event)
  // // ※新添加占位符必须与模板绑定
  // if (!data.tplId) {
  //   result.errorMessage = '未指定模板id'
  //   return result
  // }
  // const dataWithOp: PlaceholderItemWithOp = data
  // try {
  //   const created = await event.context.prisma.$transaction(async prisma => {
  //     // 序号从0开始累加，新序号==件数
  //     const newOrdinal = await prisma.tplPhItmRel.count({
  //       where: {
  //         tplId: data.tplId
  //       }
  //     })
  //     console.log('newOrdinal', newOrdinal)
  //     const dataForCreate = pick(dataWithOp, [ 'name', 'type', 'format' ])

  //     if (data.id) {
  //       // 若 占位符已存在，则绑定到指定模板
  //       await prisma.tplPhItmRel.create({
  //         data: {
  //           tplId: data.tplId,
  //           phItmId: data.id,
  //           ordinal: newOrdinal,
  //           version: 0
  //         }
  //       })
  //       return await prisma.placeholderItem.findUnique({
  //         where: {
  //           id: data.id
  //         }
  //       })
  //     } else {
  //       // 若 占位符不存在，则保存占位符并绑定到指定模板
  //       const id = uuid()
  //       return await prisma.placeholderItem.create({
  //         data: {
  //           id: id,
  //           ...dataForCreate,
  //           version: 0,
  //           templates: {
  //             create: {
  //               ordinal: newOrdinal,
  //               version: 0,
  //               template: {
  //                 connect: {
  //                   id: data.tplId
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       })
  //     }
  //   })
  //   result.data = created
  //   result.success = true
  // } catch(e) {
  //   if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
  //     result.success = false
  //     result.errorMessage = `存在唯一约束冲突，无法使用名称<${dataWithOp.name}>`
  //   } else {
  //     throw e
  //   }
  // }
  // return result
})
