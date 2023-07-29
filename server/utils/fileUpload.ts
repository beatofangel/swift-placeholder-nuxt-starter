import { Server } from '@tus/server'
import { FileStore } from '@tus/file-store'
import path from 'path'
import fs from 'fs'

const { storageConfigFolder } = useDocConfig()
const tempFolder = path.join(storageConfigFolder, 'temp')
if (!fs.existsSync(tempFolder)) {
  fs.mkdirSync(tempFolder, { recursive: true })
}
const upload = new Server({
  path: '/api/upload',
  datastore: new FileStore({ directory: tempFolder })
})
const templatesFolder = path.join(storageConfigFolder, 'templates')
if (!fs.existsSync(templatesFolder)) {
  fs.mkdirSync(templatesFolder, { recursive: true })
}
const templatesUpload = new Server({
  path: '/api/templates/upload',
  datastore: new FileStore({ directory: templatesFolder })
})
export const useTusServer = () => {
  return {
    upload,
    templatesUpload
  }
}
