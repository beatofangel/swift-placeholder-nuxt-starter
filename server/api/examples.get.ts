/**
 * Fetch all `examples` from the database. Run `npx prisma db push` at least once for this to work.
 *
 * If you are using `tRPC` you can access the prisma-client by adding it to the context:
 * ```ts
 * export async function createContext(event: H3Event) {
 *   return { prisma: event.context.prisma }
 * }
 *
 * export type Context = inferAsyncReturnType<typeof createContext>
 * ```
 */
export default defineEventHandler(event => event.context.prisma.businessCategory.findMany({
  select: {
    id: true,
    name: true,
    icon: true,
    parent: {
      select: {
        id: true,
        name: true,
        icon: true,
        parent: {
          select: {
            id: true,
            name: true,
            icon: true
          }
        }
      }
    },
    templates: {
      select: {
        ordinal: true,
        template: {
          select: {
            id: true,
            name: true,
            path: true,
            placeholderItems: {
              select: {
                ordinal: true,
                placeholderItem: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                    format: true,
                    placeholderTags: {
                      select: {
                        ordinal: true,
                        placeholderTag: {
                          select: {
                            id: true,
                            name: true
                          }
                        }
                      },
                      orderBy: {
                        ordinal: 'desc'
                      }
                    }
                  }
                }
              },
              orderBy: {
                ordinal: 'desc'
              }
            }
          }
        }
      },
      orderBy: {
        ordinal: 'desc'
      }
    }
  },
  where: {
    templates: {
      some: {
        template: {
          isNot: null
          // placeholderItems: {
          //   some: {
          //     placeholderItem: {
          //       isNot: null
          //     }
          //   }
          // }
        }
      }
    }
  },
  orderBy: {
    ordinal: 'desc'
  }
}))
