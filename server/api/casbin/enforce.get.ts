export default defineEventHandler(event => {
  const { sub, obj, act } = getQuery(event)
  console.debug(sub, obj, act)
  return event.context.casbin.enforce(sub, obj, act)
})
