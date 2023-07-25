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
