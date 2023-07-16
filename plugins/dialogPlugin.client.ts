import { CommonDialog } from "#components"
import { Plugin, createApp, App } from "vue"
export type DialogParams = {
  title?: string,
  text: string | Function,
  op?: EditMode,
  error?: boolean,
  info?: boolean,
  warning?: boolean,
  cancelable?: boolean,
  closable?: boolean,
  persistent?: boolean,
  onOk?: () => void,
  onCancel?: () => void,
  onClosed?: () => void
}

export enum EditMode {
  Create = 1, Read = 2, Update = 3, Delete = 4
}

export default defineNuxtPlugin(nuxtApp => {
  const installed = ref(false)
  console.log(CommonDialog)
  const plugin: Plugin = {
    install(app) {
      if (installed.value) return
      console.log('register dialog plugin')
      app.component('CommonDialog', CommonDialog)
      let dialogApp: App<Element>
      const container = document.createElement('div')
      const baseDialog = (data: DialogParams) => {
        data.title = data.title || useNuxtApp().$config.public.appName
        const customOnClosed = data.onClosed || (() => { })
        data.onClosed = () => {
          customOnClosed()
          dialogApp && dialogApp.unmount()
        }
        const dialog = h(CommonDialog, data)
        dialogApp = createApp(dialog)
        // @ts-ignore
        dialogApp.use(app.config.globalProperties.$vuetify)
        dialogApp.mount(container)
      }
      app.config.globalProperties['$dialog'] = (data: DialogParams) => baseDialog(data)
      app.config.globalProperties['$dialogConfirm'] = (data: DialogParams) => {
        data.info = true
        data.cancelable = true
        data.closable = true
        data.persistent = true
        baseDialog(data)
      }
      app.config.globalProperties['$dialogInfo'] = (data: DialogParams) => {
        data.info = true
        data.cancelable = false
        data.closable = true
        data.persistent = false
        baseDialog(data)
      }
      app.config.globalProperties['$dialogWarning'] = (data: DialogParams) => {
        data.warning = true
        data.cancelable = true
        data.closable = true
        data.persistent = true
        baseDialog(data)
      }
      app.config.globalProperties['$dialogError'] = (data: DialogParams) => {
        data.error = true
        data.cancelable = false
        data.closable = true
        data.persistent = true
        baseDialog(data)
      }
      installed.value = true
    },
  }

  nuxtApp.vueApp.use(plugin)
})
