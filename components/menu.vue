<template>
  <v-navigation-drawer
    rail-width="48"
    v-if="!showLogin"
    rail
    permanent
    :theme="isDarkMode ? 'dark' : 'light'"
  >
    <v-tabs
      grow
      direction="vertical"
    >
      <template v-for="link in links" :key="link.name">
        <v-tooltip transition="fade-transition" right>
          <template v-slot:activator="{ props }">
            <v-tab
              style="-webkit-user-drag: none; min-width: unset; justify-content: center;"
              v-bind="props"
              :to="link.path"
            >
              <v-icon size="32" left>{{
                $route.path == link.path || isDarkMode
                  ? link.icon
                  : `${link.icon}-outline`
              }}</v-icon>
            </v-tab>
          </template>
          {{ link.name }}
        </v-tooltip>
      </template>
      <v-divider></v-divider>
      <v-tooltip transition="fade-transition" right>
        <template v-slot:activator="{ props }">
          <v-btn
            @click="toggleDarkMode"
            v-bind="props"
            min-width="48"
            width="48"
            height="48"
            variant="text"
          >
            <v-icon
              size="32"
              :color="isDarkMode ? 'yellow darken-2' : 'blue lighten-1'"
            >
              {{ isDarkMode ? "mdi-weather-sunny" : "mdi-weather-night" }}
            </v-icon>
          </v-btn>
        </template>
        {{ isDarkMode ? "关闭" : "开启" }}夜间模式
      </v-tooltip>
      <v-bottom-sheet v-model="dialog.settingDialog">
        <template v-slot:activator="{ props: bottomSheetProps }">
          <v-tooltip transition="fade-transition" right>
            <template v-slot:activator="{ props }">
              <v-hover v-slot="{ isHovering, props: hoverProps }">
                <v-btn
                  @click="dialog.settingDialog = !dialog.settingDialog"
                  v-bind="Object.assign(bottomSheetProps, props, hoverProps)"
                  class="px-0"
                  min-width="48"
                  width="48"
                  height="48"
                  variant="text"
                >
                  <v-icon
                    size="32"
                    :class="{ 'rotate-transition-120': true }"
                    :color="
                      isDarkMode ? 'secondary lighten-4' : 'secondary lighten-2'
                    "
                    >mdi-cog</v-icon
                  >
                </v-btn>
              </v-hover>
            </template>
            设置
          </v-tooltip>
        </template>
        <v-sheet class="text-center">
          <v-card>
            <v-toolbar dense flat>
              <v-icon color="primary" class="mr-3">mdi-cog</v-icon>
              <v-app-bar-title>设置</v-app-bar-title>
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                color="red"
                @click="dialog.settingDialog = !dialog.settingDialog"
                icon
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-toolbar>
            <v-card-text>
              <v-row>
              </v-row>
            </v-card-text>
          </v-card>
        </v-sheet>
      </v-bottom-sheet>
      <v-container
        class="pa-0 fill-height draggable-region"
        fluid
      ></v-container>
    </v-tabs>
    <!-- <v-dialog v-model="showLogin" width="unset" no-click-animation hide-overlay persistent light>
      <common-login @input="e=>showLogin = e"></common-login>
    </v-dialog> -->
    <!-- 避免遮罩层挡住app-bar -->
    <v-overlay :absolute="true" :value="showLogin"></v-overlay>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useTheme } from "vuetify";
import { VBottomSheet } from "vuetify/lib/labs/components.mjs";
import { Link } from "~/index";
const theme = useTheme();
const showLogin = ref(false);
const dialog = ref({
  settingDialog: false,
});

const links = ref(new Array<Link>());
useRouter().options.routes.filter(pRoute=>!pRoute.meta?.invisible).forEach((pRoute) => {
  console.log('router:', pRoute.path)
  links.value.push({
    name: pRoute.name,
    path: pRoute.path,
    icon: pRoute.meta?.icon,
    index: pRoute.meta?.index || 9999,
  } as Link);
});
links.value.sort((a, b) => a.index - b.index)

const isDarkMode = computed(() => {
  return theme.global.current.value.dark;
});

// methods
function toggleDarkMode() {
  theme.global.name.value = theme.global.current.value.dark ? "light" : "dark";
}
</script>
