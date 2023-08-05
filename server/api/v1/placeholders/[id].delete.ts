import { Prisma } from "@prisma/client"
import { isEmpty, pick } from "lodash-es";
import { Result } from "server/utils/http";

export default defineEventHandler(async event => {
  // const result: Result = { success: false }
  // const id = event.context.params?.id
  // const query = pick(getQuery(event), [ 'tplId', 'version' ])
  // if (!id) {
  //   result.errorMessage = '未指定id'
  //   return result
  // }
  // if (query.version == undefined) {
  //   result.errorMessage = '未指定version'
  //   return result
  // }
  // const version = query.version as number
  // const deleted = await event.context.prisma.$transaction(async prisma => {
  //   // 获取与待删除占位符关联的模板数量 ※若 未传入模板id，则 认为待删除占位符未与
  //   const whereClause: Prisma.TplPhItmRelWhereInput = { phItmId: id }
  //   if (!isEmpty(query.tplId)) {
  //     whereClause.tplId = {
  //       not: query.tplId as string
  //     }
  //   }
  //   const count = await prisma.tplPhItmRel.count({
  //     where: whereClause
  //   })

  //   let del
  //   let delRel
  //   if (count > 0) {
  //     if (isEmpty(query.tplId)) {
  //       // 待删除占位符没有绑定模板，但此处能取到与模板的关联数据，判定为异常情况
  //       throw new Error(MSG_SYSTEM_ERROR)
  //     } else {
  //       // 待删除占位符已与其他模板关联，断开待删除占位符与模板关联
  //       delRel = await prisma.tplPhItmRel.delete({
  //         where: {
  //           tplId_phItmId: {
  //             tplId: query.tplId as string,
  //             phItmId: id
  //           }
  //         }
  //       })
  //       // 获取待删除占位符
  //       del = await prisma.placeholderItem.findUnique({
  //         where: {
  //           id: id
  //         }
  //       })
  //     }
  //   } else {
  //     // 获取待删除占位符关联
  //     delRel = await prisma.tplPhItmRel.findUnique({
  //       where: {
  //         tplId_phItmId: {
  //           tplId: query.tplId as string,
  //           phItmId: id
  //         }
  //       }
  //     })
  //     // 删除占位符(onDelete: Cascade)
  //     del = await prisma.placeholderItem.delete({
  //       where: {
  //         id: id,
  //         version: version
  //       }
  //     })
  //   }

  //   // 更新占位符序号（序号大于待删除占位符） ※未与模板绑定的占位符无需更新
  //   delRel && await prisma.tplPhItmRel.updateMany({
  //     data: {
  //       ordinal: {
  //         increment: -1
  //       },
  //       version: {
  //         increment: 1
  //       }
  //     },
  //     where: {
  //       tplId: query.tplId as string,
  //       ordinal: {
  //         gt: delRel.ordinal
  //       }
  //     }
  //   })

  //   return del
  // })
  // result.data = deleted
  // result.success = true
  // return result
})
