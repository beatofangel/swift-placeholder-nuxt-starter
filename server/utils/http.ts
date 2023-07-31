export type Result = {
  success: boolean,
  data?: Record<string, any> | any[] | number | null,
  errorMessage?: string
}
export const MSG_SYSTEM_ERROR = "系统异常"