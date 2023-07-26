import { setLocale } from 'yup';
import { messages } from '@vee-validate/i18n/dist/locale/zh_CN.json';
export default defineNuxtPlugin(nuxtApp => {
  setLocale({
    mixed: {
      default: messages._default.replaceAll('{field}', '${path}'),
      required: messages.required.replaceAll('{field}', '${path}'),
    }
  })
})
