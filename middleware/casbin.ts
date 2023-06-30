export default defineNuxtRouteMiddleware(async (to, from) => {
  const { data: session, status } = useAuth()
  if (status.value === 'authenticated') {
    const params = { sub: (session.value as any).roles, obj: to.path, act: 'read' }
    console.debug(params)
    const { data: allowed } = await useFetch('/api/casbin/enforce', { query: params})
    console.log(`access to ${to.path} is ${allowed.value ? 'allowed' : 'denied'}.`)
    if (!allowed.value) {
      // return abortNavigation('Insufficient permissions.')
      // throw createError({ statusCode: 403, statusMessage: 'Access is denied' })
      return navigateTo(from)
    }
  } else {
    console.log(status.value)
    return navigateTo('/login', { redirectCode: 401 })
  }
})
