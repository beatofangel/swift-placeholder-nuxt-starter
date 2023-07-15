<template>
  <v-container class="pa-0" fluid>
    <v-app-bar density="compact" flat>
      <v-slide-group v-model="tab" @change="onChanged" show-arrows mandatory style="max-width: calc(100vw - 176px)"
        class="align-self-end">
        <v-slide-group-item v-for="(item, index) in sessions" :key="index" v-slot="{ isSelected, toggle }">
          <div class="align-self-end">
            <!-- 由于添加了tooltip，必须在外层嵌套一个容器否则会导致激活标签无法自动显示 -->
            <v-tooltip open-delay="1000" location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" class="mx-1 tab-border-top rounded-b-0 bg-background" :class="{
                  active: isSelected,
                  'primary--text': isSelected && !editing[item.id],
                  'error--text': editing[item.id],
                  'grey--text text--darken-2': !isSelected && !editing[item.id],
                  'font-weight-bold': isSelected,
                }" :color="isSelected ? 'primary' : 'grey lighten-3'" @click="toggle" :elevation="isSelected ? 4 : 2"
                  :size="isSelected ? 'default' : 'small'" :ripple="false">
                  <div style="max-width: 160px" class="text-truncate">
                    {{
                      `${editing[item.id] ? "* " : ""}${calcSessionName(item)}`
                    }}
                  </div>
                  <v-btn density="compact" size="small" :color="isSelected ? 'primary' : 'grey lighten-3'"
                    class="rounded-sm" icon="mdi-close" @click.stop="closeReplacementTab(item)"></v-btn>
                </v-btn>
              </template>
              {{ calcSessionName(item) }}
            </v-tooltip>
          </div>
        </v-slide-group-item>
      </v-slide-group>
      <v-hover v-slot="{ isHovering, props }">
        <v-btn v-bind="props" @click="newReplacement" class="align-self-end" size="small" density="comfortable" icon>
          <v-icon color="success">mdi-plus</v-icon>
        </v-btn>
      </v-hover>
      <v-menu v-model="showReplaceMenu" offset-y :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <v-hover v-slot="{ isHovering, props: hoverProps }">
            <v-btn style="position: absolute; right: 16px" v-bind="Object.assign(hoverProps, props)" height="100%"
              min-width="48" class="px-2" depressed tile>
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </v-hover>
        </template>
        <v-list min-width="280" density="comfortable">
          <template v-for="(
              { name, icon, shortcut, handler, disabled }, key
            ) in dotMenuList" :key="key">
            <v-list-item @click="handler" :disabled="disabled?.value">
              <template v-slot:prepend>
                <v-icon :icon="icon"></v-icon>
              </template>
              <v-list-item-title v-text="name"></v-list-item-title>
              <v-list-item-subtitle class="text-no-wrap d-flex justify-start">
                <CommonKey :shortcuts="shortcut" no-decorate></CommonKey>
              </v-list-item-subtitle>
            </v-list-item>
          </template>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-layout full-height>
      <v-navigation-drawer v-if="sessions.length > 0" width="600" :expand-on-hover="!pinned" permanent :rail="!pinned">
        <v-row>
          <v-col>
            <v-list width="600" density="comfortable">
              <v-list-item prepend-icon="mdi-menu" title="替换">
                <template v-slot:prepend>
                  <v-icon color="red">mdi-swap-horizontal-variant</v-icon>
                </template>
                <template v-slot:append>
                  <v-tooltip>
                    <template v-slot:activator="{ props }"><v-btn v-bind="props"
                        :icon="pinned ? 'mdi-pin-outline' : 'mdi-pin-off-outline'" :color="pinned ? 'primary' : 'grey'"
                        variant="text" density="compact" @click="pinned = !pinned">
                      </v-btn>
                    </template>
                    {{ pinned ? '取消固定' : '固定' }}
                  </v-tooltip>
                </template>
              </v-list-item>
              <v-divider class="my-2"></v-divider>
              <v-list-item>
                <template v-slot:prepend>
                  <v-tooltip
                    location="top"
                  >
                    <template v-slot:activator="{ props }">
                      <v-icon class="mr-0 mb-5" v-bind="props" size="large" :color="['primary', 'light-green', 'orange'][selectedBusinessCategory.level ?? 0]" :icon="selectedBusinessCategory.selected?.icon"></v-icon>
                    </template>
                    <span>{{ selectedBusinessCategory.selected?.name }}</span>
                  </v-tooltip>
                </template>
                <v-list-item-title>
                  <v-card>
                    <v-card-text>
                      <v-row>
                        <v-col>
                          <BusinessCategoryPanel ref="selectedBusinessCategory" v-model="sessions[tab].businessCategory"></BusinessCategoryPanel>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-list-item-title>
              </v-list-item>
              <!-- <替换>面板 -->
              <v-list-item class="px-0">
                <ReplacementTab ref="currentReplaceTab" v-if="sessions.length > 0" v-model:id="sessions[tab].id" v-model:templates="sessions[tab].templates" @update:config="updateDocConfig">
                </ReplacementTab>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-navigation-drawer>
      <v-main>
        <v-card style="height: calc(100dvh - 114px);" flat>
          <!-- <v-card-text style="height: calc(100dvh - 140px);"> -->
            <div v-if="sessions.length == 0" style="height: calc(100vh - 124px);"
              class="d-flex flex-column justify-center align-center no-click">
              <div class="text-xl-h1 text-lg-h2 text-md-h3 text-sm-h4 text-h5 font-weight-medium mb-8 mt-n12">
                <common-key :shortcuts="shortcutNew">
                  <template v-slot:prepend><span class="text--disabled text-no-wrap">按下&nbsp;</span></template>
                  <template v-slot:group-delimiter><span class="text--disabled">&nbsp;或&nbsp;</span></template>
                </common-key>
              </div>
              <div
                class="text-xl-h1 text-lg-h2 text-md-h3 text-sm-h4 text-h5 font-weight-medium text--disabled mt-8 mb-12">
                开启全新替换旅程！
              </div>
            </div>
            <DocumentEditor v-if="config.document" id="doc-editor" :document-server-url="documentServerApiUrl"
              :config="config" :events_on-app-ready="onAppReady" :events_on-document-ready="onDocumentReady"
              :on-load-component-error="onLoadComponentError" />
          <!-- </v-card-text> -->
        </v-card>
      </v-main>
    </v-layout>
  </v-container>
</template>

<script setup lang="ts">
import { DocumentEditor, IConfig } from '@onlyoffice/document-editor-vue'
import type { Template, WorkData, Placeholder, Connector } from '~/index';
import { queue } from 'async-es'
const pinned = ref(true)
definePageMeta({
  middleware: ['casbin'],
  icon: "mdi-file-replace",
  index: 1
});

// mounted
onMounted(() => {
  pinned.value = usePlaceholderPinned().value
  $fetch('/api/replacements').then(({ data }) => {
    sessions.value = data
  })
})

// data
const showDialog = ref(false)
watch(showDialog, (val) => console.log(val))
const tab = ref(0)
const sessions = ref([] as WorkData[])
const editing = ref({} as Record<string, boolean>)
const showReplaceMenu = ref(false)
const selectedBusinessCategory = ref({} as { selected: {icon: string; name: string} | null, level: number | undefined })
const currentReplaceTab = ref({} as { placeholders: Placeholder[]})

// watch
watch(pinned, (val) => {
  console.log('pinned:', val)
  usePlaceholderPinned().value = val
})

// computed
const noSessionDisabled = computed(() => {
  return sessions.value.length == 0
})
const shortcutNew = computed(() => {
  return shortcuts.value.find((e) => e.id == "new")!.shortcut;
})
const shortcuts = computed(() => {
  return [
    {
      id: "new",
      handler: () => {
        showReplaceMenu.value = false;
        newReplacement();
      },
      icon: "mdi-plus",
      name: "新建",
      shortcut: [
        ["ctrl", "n"],
        ["shift", "n"],
      ],
    },
    {
      id: "close",
      handler: () => {
        sessions.value[tab.value] &&
          closeReplacementTab(sessions.value[tab.value]);
      },
      name: "关闭",
      shortcut: ["ctrl", "w"],
      invisible: true,
    },
    {
      id: "replace",
      handler: () => {
        if (noSessionDisabled) return;
        showReplaceMenu.value = false;
        doReplace();
      },
      icon: "mdi-file-document-outline",
      name: "替换",
      disabled: noSessionDisabled,
      shortcut: ["ctrl", "r"],
    },
    {
      id: "replaceAll",
      handler: () => {
        if (noSessionDisabled) return;
        showReplaceMenu.value = false;
        doReplaceAll();
      },
      icon: "mdi-file-document-multiple-outline",
      name: "全部替换",
      disabled: noSessionDisabled,
      shortcut: ["ctrl", "shift", "r"],
    },
  ];
})
const dotMenuList = computed(() => {
  return shortcuts.value.filter((e) => !e.invisible);
})

// methods
function onChanged(index: number) {
  console.log(index);
}
function calcSessionName(item: WorkData) {
  if (item.businessCategoryDisplay) {
    return `${item.businessCategoryDisplay}-${item.id}`;
  } else {
    return `替换-${item.id}`;
  }
}
function closeReplacementTab({ id }: { id: string }) {
  // $dialog
  //   .confirm({ text: `即将删除本次替换，是否继续？` })
  //   .then((res) => {
  //     if (res) {
  //       const index = sessions.value.findIndex((e) => e.id == id);
  //       if (index != -1) {
  //         const session = sessions.value.splice(index, 1);
  //         if (session.length > 0) {
  //           // TODO
  //           // window.store.deleteSession(session[0].id);
  //         }
  //       }
  //     }
  //   });
}
/**
 * 新建替换（标签页）
 */
function newReplacement() {

}
function doReplace() {

}
function doReplaceAll() {

}
// function handleBusinessCategoryChange(sessionId: string, businessCategoryDisplay: string) {
//   const session = sessions.value.find((s) => s.id == sessionId);
//   session!['businessCategoryDisplay'] = businessCategoryDisplay;
//   console.log(session);
// }

// ============================= Document Editor ====================================
const config = ref({} as IConfig)
const zoom = ref(100)
const { documentServerApiUrl } = useRuntimeConfig().public
async function getConfig(template: Template) {
  const { data: config } = await useFetch('/api/doc/config', {
    query: {
      zoom: zoom, title: template.name, url: template.path, mode: 'edit'
    }
  })
  return config.value
}
async function updateDocConfig(template: Template) {
  await getConfig(template).then(data => {
    console.log('documentConfig', data)
    config.value = data as any
  })
}
function onDocumentReady() {
  console.log("Document is loaded");
  // initialize connector
  window.connector = ref(window.DocEditor.instances['doc-editor'].createConnector())
  // syncDocument()
  const { validatePlaceholders } = useDocumentHelper().value
  validatePlaceholders(currentReplaceTab.value.placeholders, true, result => {
    if (result.warning) {
      console.log(result)
    }

  })
}
function onAppReady() {
  console.log('OnlyOffice is Ready')
  // initialize docQueue
  window.docQueue = ref(queue(function ({ doc }: any, callback: Function) {
    console.log('consume queue');
    window.connector.value.executeMethod("InsertAndReplaceContentControls", [doc], callback);
  }, 1 /* no concurrency */));
  window.docQueue.value.drain(function () {
    console.log('all items have been processed');
    useDocumentHelper().value.moveCursorToStart()
  });
}
function onLoadComponentError(errorCode: number, errorDescription: string) {
  console.error(errorCode, errorDescription)
}
// ============================= Document Editor ====================================
</script>

<style scoped>
/* ::v-deep(.tab-border-top) {
  border-top: 1px solid rgb(var(--v-theme-on-secondary)) !important;
} */
</style>
