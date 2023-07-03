// @ts-ignore
import colors from 'vuetify/lib/util/colors'
import { zhHans } from 'vuetify/locale'
import { md1, md2, md3 } from 'vuetify/blueprints'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@sidebase/nuxt-auth',
    '@invictus.codes/nuxt-vuetify'
  ],
  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.min.css'
  ],
  // sourcemap: {
  //   server: true,
  //   client: true
  // },
  auth: {
    // baseURL: process.env.AUTH_ORIGIN,
    origin: process.env.AUTH_ORIGIN,
    enableGlobalAppMiddleware: true
  },
  vuetify: {
    vuetifyOptions: {
      blueprint: md2,
      // @TODO: list all vuetify options
      theme: {
        themes: {
          light: {
            dark: false,
            // colors: {
            //   primary: '#F37984',
            //   secondary: '#F3BDB0',
            //   'secondary-lighten-1': '#FFF0ED',
            // },
            variables: {
              scrollbarTrack: colors.grey.lighten4,
              scrollbarThumb: colors.grey.lighten1,
              scrollbarThumbHover: colors.grey.darken1
            }
          },
          dark: {
            dark: true,
            // colors: {
            //   primary: '1B262C',
            //   secondary: '0F4C75',
            // },
            variables: {
              scrollbarTrack: colors.grey.darken1,
              scrollbarThumb: colors.grey.lighten1,
              scrollbarThumbHover: colors.grey.lighten4
            }
          }
        }
      },
      ssr: true,
      locale: {
        locale: 'zhHans',
        messages: { zhHans }
      },
      icons: {
        defaultSet: 'mdi'
      }
    },
    moduleOptions: {
      /* nuxt-vuetify module options */
      // treeshaking: false,
      useIconCDN: false, // 使用本地图标库@mdi/font

      /* vite-plugin-vuetify options */
      styles: {
        configFile: 'assets/styles/settings.scss'
      },
      autoImport: true
    }
  },
  typescript: {
    shim: false
  }
})
