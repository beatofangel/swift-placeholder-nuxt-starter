import { HTTPMethod } from "index"

export default defineEventHandler(async event => {
  const methods: Record<HTTPMethod, Function> = {
    async GET() {
      return await event.context.prisma.businessCategory.findMany({
        include: {
          children: {
            include: {
              children: true
            }
          }
        },
        where: {
          parent: {
            is: null
          }
        },
        orderBy: {
          ordinal: "asc"
        }
      })
    },
    // async POST() {
    //   const { data } = await readBody(event)
    //   return await event.context.prisma.workspace.create({
    //     data: {
    //       type: 'REPLACEMENT',
    //       owner: username,
    //       data: Array.isArray(data) ? data : [data]
    //     }
    //   })
    // }
  }
  const method = methods[getMethod(event)]
  return method && (method())
})
