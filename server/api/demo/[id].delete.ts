export default defineEventHandler(event => {
    return 'DELETE' + event.context.params?.id
})