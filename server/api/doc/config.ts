import { getServerSession } from "#auth"
import path from "path"
import { HTTPMethod, SessionWrapper } from "~/index"

export default defineEventHandler(async event => {
  const serverUrl = getRequestURL(event, {
    xForwardedHost: true,
    xForwardedProto: true
  })
  const { zoom, title, url, mode } = getQuery(event)

  // local upload link
  // /api/XXXXX/upload/XXXXX
  let validUrlString = url as string // /templates/xxxxxxx
  // try {
  //   const validUrl = new URL(url as string)
  //   if (validUrl.host == new URL(process.env.AUTH_ORIGIN!).host) {
  //     const regex = /\/api(\/.*)\/upload(\/.*)/
  //     validUrlString = validUrl.pathname.replace(regex, '$1$2')
  //   }
  // } catch (e) {
  //   console.log('not a valid url')
  // }

  const session = await getServerSession(event)
  const docManager = useDocManager()
  const docService = useDocService()
  if (!session) throw createError({ statusMessage: 'Unauthenticated', statusCode: 401 })
  const uid = (session as SessionWrapper).uid
  // const createUrl = docManager.getCreateUrl(serverUrl.toString(), FileType.word, uid, 'desktop', 'zh')
  const methods: Record<HTTPMethod, Function> = {
    async GET() {
      return await event.context.prisma.user.findFirst({
        select: {
          name: true,
          docFavourite: true,
          docGroup: {
            select: {
              name: true
            }
          },
          docPerm: {
            include: {
              reviewGroups: {
                select: {
                  docGroup: {
                    select: {
                      name: true
                    }
                  }
                }
              },
              commentViewGroups: {
                select: {
                  docGroup: {
                    select: {
                      name: true
                    }
                  }
                }
              },
              commentEditGroups: {
                select: {
                  docGroup: {
                    select: {
                      name: true
                    }
                  }
                }
              },
              commentRemoveGroups: {
                select: {
                  docGroup: {
                    select: {
                      name: true
                    }
                  }
                }
              },
              userInfoGroups: {
                select: {
                  docGroup: {
                    select: {
                      name: true
                    }
                  }
                }
              },
            }
          }
        },
        where: {
          id: uid
        }
      }).then(result => {
        if (!result) {
          return null
        }
        const { docPerm, ...docConfig } = result
        const { reviewGroups, commentViewGroups, commentEditGroups, commentRemoveGroups, userInfoGroups, ...perms } = docPerm!
        const configuration =  {
          documentType: "word",
          token: '',
          type: "desktop",
          // height: '100%',
          // width: '100%',
          document: {
            fileType: "docx",
            key: docManager.getKey(validUrlString),
            // key: key || "",
            title: title,
            url: docManager.getDownloadUrl(validUrlString),
            info: {
              favorite: docConfig.docFavourite,
              folder: "",
              owner: docConfig.name,
              sharingSettings: [
                {
                  isLink: true,
                  permissions:"Read Only",
                  user: "Anonymous"
                },
                {
                  permissions:"Full Access",
                  user: "Me"
                }
              ],
              uploaded: null
            },
            permissions: {
              ...perms,
              commentGroups: {
                  edit: commentEditGroups.map(g=>g.docGroup.name),
                  remove: commentRemoveGroups.map(g=>g.docGroup.name),
                  view: commentViewGroups.map(g=>g.docGroup.name)
              },
              reviewGroups: reviewGroups.map(g=>g.docGroup.name),
              userInfoGroups: userInfoGroups.map(g=>g.docGroup.name)
            }
          },
          editorConfig: {
            actionLink: '',
            callbackUrl: docManager.getCallback(validUrlString),
            coEditing: {
              mode: 'fast',
              change: true
            },
            createUrl: '', // createUrl,
            lang: 'zh',
            location: '',
            mode: mode || 'edit',
            recent: [],
            region: 'zh',
            templates: [],
            user: {
              group: result.docGroup?.name,
              id: uid,
              name: result.name
            },
            customization: {
              zoom: zoom ?? 100,
              hideRightMenu: true,
              compactToolbar: true,
              hideRulers: true,
              compactHeader: true,
              toolbarNoTabs: true,
              toolbarHideFileName: true
            }
          }
        }
        const token = docService.getToken(configuration)
        configuration.token = token
        // console.log('doc config:', configuration)
        return configuration
      })
    },
    async POST() {
      // const { data } = await readBody(event)
      // return await event.context.prisma.workspace.create({
      //   data: {
      //     type: 'REPLACEMENT',
      //     owner: uid,
      //     data: Array.isArray(data) ? data : [data]
      //   }
      // })
    }
  }
  const method = methods[getMethod(event)]
  return method && (method())
})
