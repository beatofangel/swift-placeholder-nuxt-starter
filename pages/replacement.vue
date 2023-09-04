<template>
  <v-container class="pa-0" fluid>
    <v-app-bar density="compact" flat>
      <v-slide-group v-model="tab" show-arrows mandatory style="max-width: calc(100vw - 176px)"
        class="align-self-end">
        <v-slide-group-item v-for="(item, index) in replacementSessions" :key="index" v-slot="{ isSelected, toggle }">
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
                      `${editing[item.id] ? "* " : ""}${item.name}`
                    }}
                  </div>
                  <v-btn density="compact" size="small" :color="isSelected ? 'primary' : 'grey lighten-3'"
                    class="rounded-sm" icon="mdi-close" @click.stop="closeReplacement(item)"></v-btn>
                </v-btn>
              </template>
              {{ item.name }}
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
          <v-list-item v-for="({ name, icon, shortcut, handler, disabled }, index) in dotMenuList" :key="index" @click="handler" :disabled="disabled">
            <template v-slot:prepend>
              <v-icon :icon="icon"></v-icon>
            </template>
            <v-list-item-title v-text="name"></v-list-item-title>
            <v-list-item-subtitle class="text-no-wrap d-flex justify-start">
              <CommonKey :shortcuts="shortcut" no-decorate></CommonKey>
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-layout full-height>
      <v-navigation-drawer v-if="replacementSessions.length > 0" width="600" :expand-on-hover="!pinned" permanent :floating="pinned"
        :rail="!pinned">
        <v-card style="height: 100%" variant="text">
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
                    <v-tooltip location="top">
                      <template v-slot:activator="{ props }">
                        <v-icon class="mr-0 mb-5" v-bind="props" size="large"
                          :color="['primary', 'light-green', 'orange', 'teal'][selectedBusinessCategory?.level ?? 3]"
                          :icon="selectedBusinessCategory?.selected?.icon"></v-icon>
                      </template>
                      <span>{{ selectedBusinessCategory?.selected?.name }}</span>
                    </v-tooltip>
                  </template>
                  <v-list-item-title>
                    <v-card>
                      <v-card-text>
                        <v-row>
                          <v-col>
                            <BusinessCategoryPanel ref="selectedBusinessCategory"
                              v-model="replacementSessions[tab].businessCategory"></BusinessCategoryPanel>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-list-item-title>
                </v-list-item>
                <!-- <替换>面板 -->
                <v-list-item class="px-0">
                  <ReplacementPanel ref="currentReplaceTab" v-if="replacementSessions.length > 0"
                    v-model:id="replacementSessions[tab].id" v-model:bcId="replacementSessions[tab].businessCategory" v-model:templates="replacementSessions[tab].templates"
                    @update:config="updateDocConfigDebounced">
                  </ReplacementPanel>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card>
      </v-navigation-drawer>
      <v-main tag="editor">
        <v-card style="height: calc(100dvh - 118px);" flat class="mt-1">
          <!-- <v-card-text style="height: calc(100dvh - 140px);"> -->
          <div v-if="replacementSessions.length == 0" style="height: calc(100vh - 124px);"
            class="d-flex flex-column justify-center align-center no-click">
            <div class="text-xl-h1 text-lg-h2 text-md-h3 text-sm-h4 text-h5 font-weight-medium mb-8 mt-n12">
              <common-key :shortcuts="shortcutNew">
                <template v-slot:prepend><span class="text--disabled text-no-wrap">按下&nbsp;</span></template>
                <template v-slot:group-delimiter><span class="text--disabled">&nbsp;或&nbsp;</span></template>
              </common-key>
            </div>
            <div class="text-xl-h1 text-lg-h2 text-md-h3 text-sm-h4 text-h5 font-weight-medium text--disabled mt-8 mb-12">
              开启全新替换旅程！
            </div>
          </div>
          <DocumentEditor v-else-if="config.document && replacementSessions[tab].templates && replacementSessions[tab].templates.length > 0" id="doc-editor" :document-server-url="documentServerApiUrl"
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
import type { Template, Workspace, Placeholder, DocWarning, Replacement } from '~/index';
import { queue } from 'async-es'
// @ts-ignore
import Mousetrap from "mousetrap"
const { $confirm } = useDialog()
definePageMeta({
  middleware: ['casbin'],
  icon: "mdi-file-replace",
  index: 1
});

// mounted
onMounted(() => {
  pinned.value = usePlaceholderPinned().value
  $fetch('/api/replacements').then((rows: { id: string, name: string, type: string, data: Replacement }[]) => {
    replacementSessions.value = rows.map(row=>{
      return { id: row.id, modified: false, name: row.name, type: row.type, businessCategory: row.data.businessCategory ?? null, templates: [] }
    })
    bindHotkeys()
  })
})

onUnmounted(() => {
  console.log('unbind hotkeys for replacement')
  unbindHotkeys()
})

// data
const saveWithPrompt = ref(true)
const pinned = ref(true)
const showDialog = ref(false)
watch(showDialog, (val) => console.log(val))
const tab = ref(0)
const replacementSessions = ref([] as Workspace[])
const editing = ref({} as Record<string, boolean>)
const showReplaceMenu = ref(false)
const selectedBusinessCategory = ref({} as { selected: { icon: string; name: string, id: string } | null, level: number | undefined })
const currentReplaceTab = ref({} as { placeholders: Placeholder[], docWarnings: DocWarning[], triggerSelectedTemplateChanged: Function })

const triggerSelectedBusinessCategoryChanged = (bcId?: string) => {
  if (replacementSessions.value[tab.value]?.id) {
    const api = `/api/v1/workspaces/${replacementSessions.value[tab.value].id}/switch-bcid/${bcId || '00000000-0000-0000-0000-000000000000'}`
    useFetch(api, {
      method: 'POST',
      body: {
        type: 'REPLACEMENT'
      }
    }).then(({ data, error }) => {
      const { name, data: wsData } = (data.value as any)
      replacementSessions.value[tab.value].name = name
      if (wsData.templates) {
        replacementSessions.value[tab.value].templates.splice(0)
        replacementSessions.value[tab.value].templates.push(...(wsData.templates as []))
      }
      console.log('触发选择模板改变事件')
      currentReplaceTab.value.triggerSelectedTemplateChanged()
    })
  }
}
// watch
watch(pinned, (val) => {
  console.log('pinned:', val)
  usePlaceholderPinned().value = val
})
watch(tab, (newVal, oldVal) => {
  console.log('当标签页改变时', oldVal, newVal)
  // 当业务分类未发生改变时，改由此监视触发【triggerSelectedTemplateChanged】
  if (replacementSessions.value.length > 0/*  && (replacementSessions.value.length <= oldVal || replacementSessions.value[oldVal].businessCategory === replacementSessions.value[newVal].businessCategory) */) {
    console.log('当业务分类未发生改变时，改由此监视触发【triggerSelectedTemplateChanged】')
    triggerSelectedBusinessCategoryChanged(replacementSessions.value[newVal].businessCategory)
  }
})
watch(() => replacementSessions.value[tab.value]?.businessCategory, (val) => {
  console.log('当业务分类改变时', val)
  triggerSelectedBusinessCategoryChanged(val)
  // if (replacementSessions.value[tab.value]?.id) {
  //   const api = `/api/v1/workspaces/${replacementSessions.value[tab.value].id}/switch-bcid/${val || '00000000-0000-0000-0000-000000000000'}`
  //   useFetch(api, {
  //     method: 'POST',
  //     body: {
  //       type: 'REPLACEMENT'
  //     }
  //   }).then(({ data, error }) => {
  //     const { name, data: wsData } = (data.value as any)
  //     replacementSessions.value[tab.value].name = name
  //     if (wsData.templates) {
  //       replacementSessions.value[tab.value].templates.splice(0)
  //       replacementSessions.value[tab.value].templates.push(...(wsData.templates as []))
  //     }
  //     console.log('触发选择模板改变事件')
  //     currentReplaceTab.value.triggerSelectedTemplateChanged()
  //   })
  // }
})

// computed
const noSessionExisted = computed(() => {
  return replacementSessions.value.length == 0
})
const shortcutNew = computed(() => {
  return shortcuts.value.find((e) => e.id == "new")!.shortcut;
})
const shortcuts = computed(() => {
  return [
    {
      id: "new",
      handler: () => {
        console.log('[new] command triggered')
        showReplaceMenu.value = false;
        newReplacement();
      },
      icon: "mdi-plus",
      name: "新建",
      shortcut: [
        // ["ctrl", "n"], // TODO
        ["shift", "n"],
      ],
    },
    {
      id: "close",
      handler: () => {
        console.log('[close] command triggered')
        replacementSessions.value[tab.value] &&
          closeReplacement(replacementSessions.value[tab.value]);
      },
      name: "关闭",
      shortcut: [
        // ["ctrl", "w"], // TODO
        ["shift", "w"],
      ],
      invisible: true,
    },
    {
      id: "replace",
      handler: () => {
        console.log('[replace] command triggered')
        if (noSessionExisted.value) return;
        showReplaceMenu.value = false;
        doReplace();
      },
      icon: "mdi-file-document-outline",
      name: "替换",
      disabled: noSessionExisted.value,
      shortcut: ["ctrl", "r"],
    },
    {
      id: "replaceAll",
      handler: () => {
        console.log('[replaceAll] command triggered')
        if (noSessionExisted.value) return;
        showReplaceMenu.value = false;
        doReplaceAll();
      },
      icon: "mdi-file-document-multiple-outline",
      name: "全部替换",
      disabled: noSessionExisted.value,
      shortcut: ["ctrl", "alt", "r"],
    },
    {
      id: "save",
      handler: () => {
        console.log('[save] command triggered')
        if (noSessionExisted.value) return;
        showReplaceMenu.value = false;
        doSave();
      },
      icon: "mdi-content-save-outline",
      name: "保存",
      disabled: noSessionExisted.value,
      shortcut: ["ctrl", "s"],
    },
    {
      id: "saveAll",
      handler: () => {
        console.log('[saveAll] command triggered')
        if (noSessionExisted.value) return;
        showReplaceMenu.value = false;
        doSaveAll();
      },
      icon: "mdi-content-save-all-outline",
      name: "全部保存",
      disabled: noSessionExisted.value,
      shortcut: ["ctrl", "alt", "s"],
    }
  ];
})
const dotMenuList = computed(() => {
  return shortcuts.value.filter((e) => !e.invisible);
})

// methods
// function onChanged(index: number) {
//   console.log(index, tab.value);
//   // triggerSelectedBusinessCategoryChanged(replacementSessions.value[index].businessCategory)
// }
// function calcSessionName(item: Workspace) {
//   if (item.name) {
//     // return `${item.businessCategoryDisplay}-${item.id}`;
//     return `${item.name}`;
//   } else {
//     return `替换-${item.id}`;
//   }
// }
function closeReplacement({ id }: { id: string }) {
  $confirm({
    text: `即将删除本次替换，是否继续？`, onOk: () => {
      const index = replacementSessions.value.findIndex((session) => session.id == id);
      if (index != -1) {
        const session = replacementSessions.value[index]
        if (session) {
          // TODO
          console.log('TODO: remove from Workspace')
          useFetch(`/api/v1/workspaces/${session.id}`, { method: 'DELETE' }).then(({ data, error }) => {
            if (data.value) {
              replacementSessions.value.splice(index, 1);
              // prevent index overflow
              if (replacementSessions.value.length <= tab.value) {
                tab.value = replacementSessions.value.length > 0 ? replacementSessions.value.length - 1 : 0
              } else {
                tab.value = tab.value > 0 ? tab.value - 1 : 0
              }
            }
          })
        }
      }
    }
  })
}
/**
 * 新建替换（标签页）
 */
function newReplacement() {
  // TODO $confirm 导致标签页拥有相同的provide ID，表现为新增多个标签页时，会同时选中或取消选中
  // $confirm({ title: '新建', text:'', onOk: ()=>{
      useFetch('/api/v1/workspaces', { method: 'POST' }).then(({ data, error }) => {
        if (error.value) {
          useToast().error(`新建替换失败！`);
        } else {
          const newSession = data.value as any
          replacementSessions.value.push({
            id: newSession.id, name: newSession.name, type: newSession.type, businessCategory: newSession.data.businessCategory ?? null, templates: newSession.data.templates ?? []
          })
          tab.value = replacementSessions.value.length - 1
        }
      })
      console.log('newReplacement')
    // }
  // })
}
function doReplace() {
  $confirm({ title: '替换', text:'', onOk: ()=>console.log('doReplace') })
}
function doReplaceAll() {
  $confirm({ title: '全部替换', text:'', onOk: ()=>console.log('doReplaceAll') })
}
import { VRow, VCol, VCheckboxBtn } from 'vuetify/components'
import { useToast } from 'vue-toastification';
import { pick, debounce } from 'lodash-es';
import replacements from 'server/api/replacements';
function doSave() {
  console.log(replacementSessions.value[tab.value], tab.value)
  saveWithPrompt.value ? $confirm({ title: '保存替换', text:() =>h(VRow,null, h(VCol, null, h(VCheckboxBtn, { label: '不再提示' }, []))), onOk: saveWorkSession}) : saveWorkSession()
}
function saveWorkSession() {
  console.log('doSave')
}
function doSaveAll() {
  console.log(replacementSessions.value)
  $confirm({ title: '保存全部替换', text:'', onOk: ()=>console.log('doSaveAll') })
}
// function handleBusinessCategoryChange(sessionId: string, businessCategoryDisplay: string) {
//   const session = replacementSessions.value.find((s) => s.id == sessionId);
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
const updateDocConfigDebounced = debounce(updateDocConfig, 50)

function onDocumentReady() {
  console.log("Document is loaded");
  // initialize connector
  const iframeWin = (document.querySelector('[name=frameEditor]') as HTMLIFrameElement).contentWindow
  iframeWin && useConnector(window, iframeWin)
  window.docConnector.callbacks['onPluginReady'] = () => {
    // syncDocument()
    const { validatePlaceholders } = useDocumentHelper().value
    validatePlaceholders(currentReplaceTab.value.placeholders, true, result => {
      if (result.warning) {
        console.log(result)
        result.invalid?.placeholders?.forEach((placeholder) => {
          currentReplaceTab.value.docWarnings.push({
            text: [
              `占位符<${placeholder.name}>无效。`
            ]
          })
        })
        result.invalid?.contentControls?.forEach((contentControl) => {
          currentReplaceTab.value.docWarnings.push({
            text: [
              `未能匹配占位符。`,
              `ID: ${contentControl.InternalId} 名称: ${contentControl.Tag || '<未命名>'}`
            ]
          })
        })
      }

    })
  }
}
function onAppReady() {
  console.log('OnlyOffice is Ready')
  // initialize docQueue
  window.docQueue = ref(queue(function (doc: any, callback: Function) {
    console.log('consume queue');
    window.docConnector.callCommand('writeContentControl', doc, callback)
  }, 1 /* no concurrency */));
  window.docQueue.value.drain(function () {
    console.log('all items have been processed');
  });

}
function onLoadComponentError(errorCode: number, errorDescription: string) {
  console.error(errorCode, errorDescription)
}
// ============================= Document Editor ====================================
function getShortcutSet(shortcut: { shortcut: string[][] | string[] }) {
  const shortcutSet = []
  if (Array.isArray(shortcut.shortcut[0])) {
    shortcutSet.push(...shortcut.shortcut.map(keys=>Array.isArray(keys) ? keys.join('+') : keys))
  } else {
    shortcutSet.push(shortcut.shortcut.join('+'))
  }
  return shortcutSet
}
function bindHotkeys() {
  for (const shortcut of shortcuts.value) {
    if (shortcut.shortcut.length > 0) {
      const shortcutSet = getShortcutSet(shortcut)
      console.log(`bind hotkeys ${shortcut.name}-'${shortcutSet.join(',')}'for replacement`)
      Mousetrap.bind(shortcutSet, function () {
        shortcut.handler()
        return false
      })
    }
  }
}
function unbindHotkeys() {
  for (const shortcut of shortcuts.value) {
      const shortcutSet = getShortcutSet(shortcut)
      Mousetrap.unbind(shortcutSet);
    }
}
</script>

<style scoped>
/* ::v-deep(.tab-border-top) {
  border-top: 1px solid rgb(var(--v-theme-on-secondary)) !important;
} */
</style>
