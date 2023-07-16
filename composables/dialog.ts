import { DialogParams } from "plugins/dialogPlugin.client"

export const useDialog = () => {
  const { vueApp } = useNuxtApp()
  return {
    $dialog: vueApp.config.globalProperties.$dialog as (data: DialogParams) => void,
    $confirm: vueApp.config.globalProperties.$dialogConfirm as (data: DialogParams) => void,
    $info: vueApp.config.globalProperties.$dialogInfo as (data: DialogParams) => void,
    $warning: vueApp.config.globalProperties.$dialogWarning as (data: DialogParams) => void,
    $error: vueApp.config.globalProperties.$dialogError as (data: DialogParams) => void,
  }
}
