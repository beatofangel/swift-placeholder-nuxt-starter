import { configure } from 'vee-validate';
import { localize, setLocale } from '@vee-validate/i18n';
import zh_CN from '@vee-validate/i18n/dist/locale/zh_CN.json';

export default defineNuxtPlugin(nuxtApp => {
  // configure({
  //   generateMessage: localize({
  //     zh_CN,
  //   }),
  // });
  // setLocale('zh_CN')
})
