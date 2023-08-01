import { PlaceholderItem } from "@prisma/client"
import { isEmpty, pick } from "lodash-es"
import { Result } from "server/utils/http"

export default defineEventHandler(async event => {
  const result: Result = { success: false }
  const id = event.context.params?.id
  if (!id) {
    result.errorMessage = '未指定id'
    return result
  }
  const item = await readBody<PlaceholderItem>(event)
  if (isEmpty(item)) return result
  const modified = await event.context.prisma.placeholderItem.update({
    where: {
      id: item.id,
      version: item.version
    },
    data: {
      ...pick(item, [ /* 'name', */ 'type', 'format' ]), // 名称不可修改
      updatedAt: new Date(),
      version: {
        increment: 1
      }
    }
  })
  result.data = modified
  result.success = true
  return result
})
