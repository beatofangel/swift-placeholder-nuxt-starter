<template>
  <v-card>
    <v-toolbar class="pl-4" color="primary">
      <v-icon start>mdi-format-list-bulleted</v-icon>
      <span class="text-h5 ml-1 mt-1">占位符</span>
      <!-- <v-spacer></v-spacer>
      <v-btn @click="onClose" fab plain small>
        <v-icon>mdi-close</v-icon>
      </v-btn> -->
    </v-toolbar>
    <v-row class="ma-0">
      <v-col class="pa-0">
        <v-card elevation="0" tile>
          <v-card-text class="d-flex flex-nowrap pa-2">
            <v-row class="text-center">
              <v-col>
                <v-card elevation="0" tile>
                  <v-card-text class="d-flex flex-nowrap pa-2">
                    <CommonList
                      ref="innerPlaceholderCommonList"
                      style="width: 100%;"
                      height="calc(100dvh - 250px)"
                      hide-title
                      flat
                      :api="{
                        get: '/api/v1/templates/{1}/placeholders',
                        post: '/api/v1/templates/{1}/placeholders',
                        put: '/api/v1/placeholders/{1}',
                        delete: '/api/v1/templates/{1}/placeholders/{2}',
                        sort: '/api/v1/templates/{1}/placeholders/sort',
                      }"
                      :headers="placeholderHeaders"
                      title="占位符"
                      visible
                      cascade
                      :cascaded-id="template?.id"
                      cascaded-key="tplId"
                      draggable
                      show-index
                      fixed-header
                      :hide-create="!template?.id"
                      :append-items="placeholdersInDoc"
                      inline-edit
                      @append-item-create="appendItemCreateHandler"
                      @change="changeHandler"
                      @update-items="updateItemsHandler"
                    >
                      <template v-slot:[`item.type`]="{ item, disabled }">
                        <v-select name="type" v-model="item.type" :items="itemTypes" @update:model-value="$v=>$v !== 'date' && (item.format=null)" :disabled="disabled" density="compact" hide-details>
                          <template v-slot:selection="{ item: selection, index }">
                            <span v-if="xlAndUp">{{ selection.title }}</span>
                            <v-icon v-else :icon="selection.raw.icon" start></v-icon>
                          </template>
                          <template v-slot:item="{ item: listItem, index, props }">
                            <v-list-item v-bind="props" :key="index" :title="listItem.title" :value="listItem.value">
                              <template v-slot:prepend>
                                <v-icon :icon="listItem.raw.icon"></v-icon>
                              </template>
                            </v-list-item>
                          </template>
                        </v-select>
                      </template>
                      <template v-slot:[`item.format`]="{ item, disabled }">
                        <v-text-field name="format" v-model="item.format" :disabled="disabled || item.type !== 'date'" density="compact" hide-details clearable></v-text-field>
                      </template>
                      <template v-slot:append>
                        {{ "test" }}
                      </template>
                      <template
                        v-slot:editor="props"
                      >
                        <PlaceholderDetail
                          v-bind="props"
                        ></PlaceholderDetail>
                      </template>
                    </CommonList>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col>
                <v-card height="calc(100dvh - 180px)" flat>
                  <DocumentEditor v-if="template && config.document" id="producer-editor" :document-server-url="documentServerApiUrl"
                    :config="config" :events_on-app-ready="onAppReady" :events_on-document-ready="onDocumentReady"
                    :on-load-component-error="onLoadComponentError" />
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { DocumentEditor, IConfig } from '@onlyoffice/document-editor-vue';
import { queue } from 'async-es'
import { Template, Placeholder, ValidatePlaceholdersResult } from 'index';
import { useDisplay } from 'vuetify'
import { Item } from 'components/common/list'
import { validate } from 'uuid'
const { xlAndUp } = useDisplay()
const props = defineProps<{ template: Template | undefined}>()
const placeholdersInDoc = ref<Item[]>([])
watch(() => props.template, async val => {
  console.log('template chagned', val)
  // reset
  placeholdersInDoc.value.splice(0)
  if (val && val.id && val.name && val.path) {
    await updateDocConfig(val)
  }
}, {
  deep: true
})

const innerPlaceholderCommonList = ref<{items: Placeholder[]}>()
const placeholderEditor = ref({ /* items: innerPlaceholderCommonList.value?.items ?? [], */ docWarnings: [] } as { /* items: Placeholder[], */ docWarnings: ({ text: string[] })[] })
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

// watch(() => innerPlaceholderCommonList.value?.items, val => {
//   if (val && placeholdersInDoc.value.length > 0) {
//     console.log('call doSyncDocument when placeholdersList changes')
//     doSyncDocument()
//   }
// })

const { validatePlaceholders } = useDocumentHelper().value
function onDocumentReady() {
  console.log("Document is loaded");
  // initialize connector
  window.connector = ref(window.DocEditor.instances['producer-editor'].createConnector())
  // syncDocument()
  console.log(innerPlaceholderCommonList.value)
  console.log('call doSyncDocument onDocumentReady')
  doSyncDocument()
  // validatePlaceholders(innerPlaceholderCommonList.value?.items ?? [], false, result => {
  //   if (result.warning) {
  //     console.log(result)
  //     result.invalid?.placeholders?.forEach((placeholder) => {
  //       placeholderEditor.value.docWarnings.push({
  //         text: [
  //           `占位符<${placeholder.name}>无效。`
  //         ]
  //       })
  //     })
  //     result.invalid?.contentControls?.forEach((contentControl) => {
  //       const ordinal = placeholdersInDoc.value.length
  //       const duplicated = placeholdersInDoc.value.find(ph => ph.name === contentControl.Tag)
  //       if (duplicated) {
  //         duplicated.contentControls.push(contentControl)
  //       } else {
  //         placeholdersInDoc.value.push({
  //           id: undefined,
  //           name: contentControl.Tag,
  //           type: 'text',
  //           format: null,
  //           icon: undefined,
  //           ordinal: ordinal,
  //           select: false,
  //           tplName: 'N/A',
  //           contentControls: [ contentControl ]
  //         })
  //       }
  //       placeholderEditor.value.docWarnings.push({
  //         text: [
  //           `未能匹配占位符。`,
  //           `ID: ${contentControl.InternalId} 名称: ${contentControl.Tag || '<未命名>'}`
  //         ]
  //       })
  //     })
  //     console.log(placeholdersInDoc.value)
  //     useFetch('/api/placeholders', { method: 'GET', query: {
  //         name: placeholdersInDoc.value.map(ph=>ph.name)
  //       }
  //     }).then(({ data }) => {
  //       const result = data.value as Result
  //       const existedPhs = result.data as Placeholder[]
  //       placeholdersInDoc.value.forEach(ph => {
  //         const matchedPh = existedPhs.find(ePh => ePh.name == ph.name)
  //         if (matchedPh) {
  //           ph.id = matchedPh.id
  //           ph.type = matchedPh.type
  //           ph.format = matchedPh.format
  //         }
  //       })
  //     })
  //   }

  // })
}
function doSyncDocument() {
  validatePlaceholders(innerPlaceholderCommonList.value?.items ?? [], false, result => {
    getPlaceholdersInDocument(result)
    if (result.warning) {
      console.log(result)
      result.invalid?.placeholders?.forEach((placeholder) => {
        placeholderEditor.value.docWarnings.push({
          text: [
            `占位符<${placeholder.name}>无效。`
          ]
        })
      })
      result.invalid?.contentControls?.forEach((contentControl) => {
        // const ordinal = placeholdersInDoc.value.length
        // const duplicated = placeholdersInDoc.value.find(ph => ph.name === contentControl.Tag)
        // if (duplicated) {
        //   duplicated.contentControls.push(contentControl)
        // } else {
        //   placeholdersInDoc.value.push({
        //     id: undefined,
        //     name: contentControl.Tag,
        //     type: 'text',
        //     format: null,
        //     icon: undefined,
        //     ordinal: ordinal,
        //     select: false,
        //     tplName: 'N/A',
        //     contentControls: [ contentControl ]
        //   })
        // }
        placeholderEditor.value.docWarnings.push({
          text: [
            `未能匹配占位符。`,
            `ID: ${contentControl.InternalId} 名称: ${contentControl.Tag || '<未命名>'}`
          ]
        })
      })
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
function getPlaceholdersInDocument(result: ValidatePlaceholdersResult) {
  // reset
  placeholdersInDoc.value.splice(0)
  const ordinal = placeholdersInDoc.value.length
  placeholdersInDoc.value.push(...result.distinctContentControls.map((dcc, index)=>({
    id: undefined,
    name: dcc.Tag,
    type: 'text',
    format: null,
    ordinal: index + ordinal,
    // select: false,
    tplName: 'N/A',
    contentControls: dcc.contentControls
  })))
  console.log(placeholdersInDoc.value)
  useFetch('/api/v1/placeholders', { method: 'GET', query: {
      name: {
        in: placeholdersInDoc.value.filter(ph=>ph.name && !validate(ph.name)).map(ph=>ph.name)
      }
    }
  }).then(({ data }) => {
    const existedPhs = data.value as Placeholder[]
    placeholdersInDoc.value.forEach(ph => {
      const matchedPh = existedPhs.find(ePh => ePh.name == ph.name)
      if (matchedPh) {
        ph.id = matchedPh.id
        ph.type = matchedPh.type
        ph.format = matchedPh.format
      }
    })
  })
}
function appendItemCreateHandler(item: Item) {
  console.log('appendItemCreateHandler', item)
  // sync placeholder to document
  useDocumentHelper().value.bindContentControl(item as unknown as Placeholder)
}
function changeHandler(item: Item | undefined) {
  if (item) {
    if (item.mode === EditMode.Delete) {
      const unlinked = placeholdersInDoc.value.find(ph=>ph.name === item.id)
      if (unlinked) {
        unlinked.id = item.id // 若 占位符本体被删除 则 为undefined
        unlinked.name = item.name
      }
      useDocumentHelper().value.unbindContentControl(item as unknown as Placeholder)
    }
  }
}
function updateItemsHandler(items: Item[]) {
  if (placeholdersInDoc.value.length > 0) {
    console.log('updateItemsHandler： placeholdersInDoc data exists')
    doSyncDocument()
  }
}

const placeholderHeaders = [{
    title: "名称",
    key: "name",
    class: "text-center",
    cellClass: "nameClass text-center text-truncate ",
    style: "min-width: 64px;"
  },
  {
    title: "类型",
    key: "type",
    class: "text-center",
    cellClass: "text-center text-truncate ",
    style: "min-width: 112px;"
  },
  {
    title: "格式",
    key: "format",
    class: "text-center",
    cellClass: "text-center text-truncate ",
    style: "min-width: 240px;"
  },
  {
    title: "所属模板",
    key: "tplName",
    class: "text-center",
    cellClass: "nameClass text-center text-truncate ",
    style: "min-width: 96px"
  },
]
const itemTypes = ref([
  { title: '文本', value: 'text', icon: 'mdi-text' },
  { title: '数字', value: 'number', icon: 'mdi-numeric' },
  { title: '日期', value: 'date', icon: 'mdi-calendar' },
])
</script>
