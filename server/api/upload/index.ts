const { upload } = useTusServer()
// upload to temp folder
export default defineEventHandler(async event => upload.handle(event.node.req, event.node.res))
