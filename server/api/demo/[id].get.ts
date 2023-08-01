export default defineEventHandler(event => {
    return 'GET ' + event.context.params?.id
})