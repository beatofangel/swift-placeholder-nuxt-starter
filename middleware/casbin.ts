// TODO: 是否从实时校验修改为登录时一次性获取？
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { data: session, status } = useAuth()
  if (status.value === 'authenticated') {
    const params = { sub: (session.value as any).uid, obj: to.path, act: 'read' }
    console.debug(`middleware - casbin(${from.fullPath}, ${to.fullPath}):`, params)
    const { data: allowed } = await useFetch('/api/casbin/enforce', { query: params })
    console.log(`middleware - casbin(${from.fullPath}, ${to.fullPath}):`, `access to ${to.path} is ${allowed.value ? 'allowed' : 'denied'}.`)
    if (!allowed.value) {
      // return abortNavigation('Insufficient permissions.')
      // throw createError({ statusCode: 403, statusMessage: 'Access is denied' })
      return navigateTo(from.path === to.path ? '/' : from)
    }
  } else {
    console.log(`middleware - casbin(${from.fullPath}, ${to.fullPath}):`, status.value)
    return navigateTo('/login', { redirectCode: 401 })
  }
})
