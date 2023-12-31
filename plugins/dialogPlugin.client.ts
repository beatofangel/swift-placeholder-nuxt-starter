import { CommonDialog } from "#components"
import { DialogParams } from "composables/dialog"
import { Plugin, createApp, App } from "vue"

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
        data.info = data.info ?? true
        data.cancelable = data.cancelable ?? true
        data.closable = data.closable ?? true
        data.persistent = data.persistent ?? true
        baseDialog(data)
      }
      app.config.globalProperties['$dialogInfo'] = (data: DialogParams) => {
        data.info = data.info ?? true
        data.cancelable = data.cancelable ?? false
        data.closable = data.closable ?? true
        data.persistent = data.persistent ?? false
        baseDialog(data)
      }
      app.config.globalProperties['$dialogWarning'] = (data: DialogParams) => {
        data.warning = data.warning ?? true
        data.cancelable = data.cancelable ?? true
        data.closable = data.closable ?? true
        data.persistent = data.persistent ?? true
        baseDialog(data)
      }
      app.config.globalProperties['$dialogError'] = (data: DialogParams) => {
        data.error = data.error ?? true
        data.cancelable = data.cancelable ?? false
        data.closable = data.closable ?? true
        data.persistent = data.persistent ?? true
        baseDialog(data)
      }
      installed.value = true
    },
  }

  nuxtApp.vueApp.use(plugin)
})
