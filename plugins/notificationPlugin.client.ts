import Toast, { POSITION, PluginOptions } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
const options: PluginOptions = {
  position: POSITION.TOP_CENTER
}
export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(Toast, options)
})
