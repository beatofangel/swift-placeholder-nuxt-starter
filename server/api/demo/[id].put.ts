export default defineEventHandler(event => {
    return 'PUT ' + event.context.params?.id
})