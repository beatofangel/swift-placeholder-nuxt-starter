const { templatesUpload } = useTusServer()
// upload templates
export default defineEventHandler(async event => templatesUpload.handle(event.node.req, event.node.res))
