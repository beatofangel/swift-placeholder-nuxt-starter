import { Server } from '@tus/server'
import { FileStore } from '@tus/file-store'
import path from 'path'
import fs from 'fs'

const { storageConfigFolder } = useDocConfig()
export const tempFolder = path.join(storageConfigFolder, 'temp')
export const templatesFolder = path.join(storageConfigFolder, 'templates')
if (!fs.existsSync(tempFolder)) {
  fs.mkdirSync(tempFolder, { recursive: true })
}
const upload = new Server({
  path: '/api/upload',
  datastore: new FileStore({ directory: tempFolder })
})
const copyUploadTo = (url: string, targetDir: string) => {
  let result = null
  try {
    const validUrl = new URL(url as string)
    if (validUrl.host == new URL(process.env.AUTH_ORIGIN!).host) {
      const regex = /\/api\/upload\/(.*)/
      const filename = validUrl.pathname.replace(regex, '$1')
      const srcPath = path.join(tempFolder, filename)
      const destPathRelative = path.join(targetDir, filename)
      const destPath = path.join(storageConfigFolder, destPathRelative)
      console.log(srcPath, destPathRelative, destPath)
      fs.copyFileSync(srcPath, destPath)
      result = destPathRelative.replaceAll('\\', '/') // 分隔符统一为'/'
    }
  } catch (e) {
    console.error(e)
  }
  console.log(result)

  return result
}
// const templatesFolder = path.join(storageConfigFolder, 'templates')
// if (!fs.existsSync(templatesFolder)) {
//   fs.mkdirSync(templatesFolder, { recursive: true })
// }
// const templatesUpload = new Server({
//   path: '/api/templates/upload',
//   datastore: new FileStore({ directory: templatesFolder })
// })
export const useTusServer = () => {
  return {
    upload,
    copyUploadTo
    // templatesUpload
  }
}
