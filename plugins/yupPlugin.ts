import { setLocale } from 'yup';
import { zh } from 'yup-locales'
export default defineNuxtPlugin(nuxtApp => {
  setLocale(zh)
})
