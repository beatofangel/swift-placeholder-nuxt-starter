export default defineNuxtRouteMiddleware(async (to, from) => {
  const { data } = useSession()
  const params = { sub: data.value.role, obj: to.path, act: 'read' }
  console.debug(params)
  const { data: allowed } = await useFetch('/api/casbin/enforce', { query: params})
  console.log(`access to ${to.path} is ${allowed.value ? 'allowed' : 'denied'}.`)
  if (!allowed.value) {
    return abortNavigation('Insufficient permissions.')
    // throw createError({ statusCode: 403, statusMessage: 'Access is denied' })
  }
})
