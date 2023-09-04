// @ts-ignore
import colors from 'vuetify/lib/util/colors'
import { zhHans } from 'vuetify/locale'
import { md1, md2, md3 } from 'vuetify/blueprints'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@sidebase/nuxt-auth',
    '@invictus.codes/nuxt-vuetify',
    '@vee-validate/nuxt'
  ],
  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.min.css'
  ],
  build: {
    transpile: [
      'vue-toastification'
    ]
  },
  routeRules: {
    '/replacement': { ssr: false },
    '/maintenance': { ssr: false },
  },
  // vite: {
  //   css: {
  //     modules: {
  //       localsConvention: 'camelCase',
  //       scopeBehaviour: 'local',
  //       generateScopedName: '[local]_[hash:5]'
  //     }
  //   }
  // },
  // components: {
  //   global: true,
  //   dirs: ['~/components']
  // },
  runtimeConfig: {
    public: {
      loginCallbackUrl: process.env.AUTH_ORIGIN,
      documentServerApiUrl: process.env.DOCUMENT_SERVER_API_URL,
      appName: process.env.APP_NAME,
      dummyRootId: process.env.DUMMY_ROOT_ID
    }
  },
  // sourcemap: {
  //   server: true,
  //   client: true
  // },
  auth: {
    // baseURL: process.env.AUTH_ORIGIN,
    origin: process.env.AUTH_ORIGIN,
    enableGlobalAppMiddleware: true
  },
  veeValidate: {
    autoImports: true
  },
  vuetify: {
    vuetifyOptions: {
      defaults: {
        VTextField: {
          variant: 'outlined'
        },
        VCascadeSelect: {
          variant: 'outlined'
        },
        VFileInput: {
          variant: 'outlined'
        },
        VSelect: {
          variant: 'outlined'
        }
      },
      blueprint: md2,
      // @TODO: list all vuetify options
      theme: {
        themes: {
          light: {
            dark: false,
            colors: {
              primary: colors.blue.lighten1,
              "row-active": colors.blue.lighten5,
              // secondary: '#F3BDB0',
              // 'secondary-lighten-1': '#FFF0ED',
              // cascade1st: colors.blue.lighten1,
              // cascade2nd: colors.lightGreen,
              // cascade3rd: colors.orange,
              // cascade4th: colors.pink,
              // cascade5th: colors.cyan,
              // cascade6th: colors.blueGrey
            },
            variables: {
              scrollbarTrack: colors.grey.lighten4,
              scrollbarThumb: colors.grey.lighten1,
              scrollbarThumbHover: colors.grey.darken1
            }
          },
          dark: {
            dark: true,
            colors: {
              primary: colors.blue.darken1,
              "row-active": colors.teal.darken2,
              // secondary: '0F4C75',
              // cascade1st: colors.blue.lighten1,
              // cascade2nd: colors.lightGreen,
              // cascade3rd: colors.orange,
              // cascade4th: colors.pink,
              // cascade5th: colors.cyan,
              // cascade6th: colors.blueGrey
            },
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
