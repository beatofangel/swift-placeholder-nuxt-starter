import { v4 as uuid } from 'uuid'
export class DocConnector {
  declare origin: Window
  declare target: Window
  declare guid: string
  declare id: string
  declare callbacks: Record<string, Function>
  constructor(origin: Window, target: Window, guid?: string) {
    this.origin = origin
    this.origin.docConnector = this
    this.target = target
    this.guid = guid ?? 'asc.{957e324a-78b2-4449-a49c-8301dcdc7660}' // plguinid fallback
    this.id = uuid()
    this.callbacks = {}
    this.origin.removeEventListener('message', this.#onMessage)
    this.origin.addEventListener('message', this.#onMessage, false)
  }
  #onMessage(event: MessageEvent<any>) {
    // console.log(event.data)
    if (event.data && ['vue-devtools-backend', 'vue-devtools-proxy'].includes(event.data.source) ) {
      // ignore debug
      return
    }
    const oriWin = this as unknown as Window
    const { connectorId, callbackId, args } = JSON.parse(event.data ?? '{}')
    // console.log('docConnector:', connectorId, 'callback:', callbackId, 'args:', args)
    // origin window scope
    /* connectorId === oriWin.docConnector.id && */ oriWin.docConnector.callbacks[callbackId] && oriWin.docConnector.callbacks[callbackId](args)
  }
  internalExecute(name: string, type: string, args: any, callback?: Function) {
    const messageObj: Record<string, any> = {
      guid: this.guid,
      type: 'onExternalPluginMessage',
      data: {
        name: name,
        type: type,
        connectorId: this.id
      }
    }
    if (args) {
      for (const key of Object.keys(args)) {
        if (key !== 'name' && key !== 'type' && key !== 'callbackId' && key != 'connectorId') {
          messageObj.data[key] = args[key]
        }
      }
    }
    if (callback) {
      const cbId = uuid()
      this.callbacks[cbId] = callback
      messageObj.data.callbackId = cbId
    }
    // console.log(messageObj)
    this.target.postMessage(JSON.stringify(messageObj), "*")
  }
  callCommand(name: string, args: any, callback?: Function) {
    this.internalExecute(name, 'callCommand', args, callback)
  }
  executeMethod(name: string, args: any, callback?: Function) {
    this.internalExecute(name, 'executeMethod', args, callback)
  }
}

export const useConnector = (origin: Window, target: Window, guid?: string) => {
  return new DocConnector(origin, target, guid)
}
