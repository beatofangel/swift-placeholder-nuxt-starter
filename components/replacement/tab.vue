<template>
  <v-container fluid>
    <v-card min-width="480" flat>
      <v-card-text>
        <v-row>
          <v-col>
            <VCascadeSelect v-model="props.data.businessCategory" :items="businessCategoryOptions" label="业务类型"
              placeholder="请选择业务类型" persistent-placeholder item-title="name" item-value="id" chips clearable open-on-clear
              :scroll-offset="0"></VCascadeSelect>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-card>
              <v-toolbar density="compact" flat>
                <v-tabs v-model="tab" ref="templateTabs" align-with-title>
                  <v-tab v-for="{ id, name } in data.templates" :key="id">
                    <span class="text-h6">{{ name }}</span>
                  </v-tab>
                  <!-- <v-banner v-if="!data.businessCategory">
                    <v-icon class="mt-n1 mr-1" color="warning">mdi-alert</v-icon>
                    <span class="text-h6">未选择业务类型</span>
                  </v-banner> -->
                </v-tabs>
                <!-- <v-spacer></v-spacer>
                <v-tooltip :text="expand ? '收缩' : '展开'" location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn height="100%" v-bind="props" @click="expand = !expand" min-width="48" color="text" class="px-2"
                      depressed tile>
                      <v-icon :icon="expand ? 'mdi-arrow-collapse' : 'mdi-arrow-expand'"></v-icon>
                    </v-btn>
                  </template>
                </v-tooltip> -->
              </v-toolbar>
              <v-layout style="height: calc(100dvh - 448px);">
                <v-row>
                  <v-col>
                    <v-list density="comfortable" class="mx-auto">
                      <v-list-item prepend-icon="mdi-menu" title="占位符">
                        <!-- <template v-slot:append>
                            <v-tooltip>
                              <template v-slot:activator="{ props }"><v-btn v-bind="props"
                                  :icon="pinned ? 'mdi-pin-outline' : 'mdi-pin-off-outline'"
                                  :color="pinned ? 'primary' : 'grey'" variant="text" density="compact"
                                  @click="pinned = !pinned">
                                </v-btn>
                              </template>
                              {{ pinned ? '取消固定' : '固定' }}
                            </v-tooltip>
                          </template> -->
                      </v-list-item>
                      <v-divider class="my-2"></v-divider>
                      <v-list-item v-for="placeholder in data.templates[tab].placeholders" :key="placeholder.id">
                        <v-list-item-title>
                          <template v-if="placeholder.type === 'date'">
                            <v-menu location="bottom" :close-on-content-click="false" :offset="[20, 88]">
                              <template v-slot:activator="{ props }">
                                <v-text-field :ref="el => setRefMap(el, placeholder.id)" density="compact" hide-details
                                  v-bind="props" :placeholder="`请输入${placeholder.name}`" clearable
                                  :value="dayjs(placeholder.value).format(placeholder.format)" readonly>
                                  <template v-slot:prepend>
                                    <v-icon icon="mdi-drag-vertical" size="large"></v-icon>
                                  </template>
                                  <template v-slot:prepend-inner>
                                    <v-chip label :variant="!!placeholder.value ? 'elevated' : 'tonal'"
                                      :color="!!placeholder.value ? 'success' : 'grey'"><v-icon start
                                        :icon="{ text: 'mdi-text', number: 'mdi-numeric', date: 'mdi-calendar' }[placeholder.type]"></v-icon>{{
                                          placeholder.name }}</v-chip>
                                  </template>
                                  <v-tooltip :disabled="!placeholder.value" activator="parent" location="right">{{
                                    dayjs(placeholder.value).format(placeholder.format) }}</v-tooltip>
                                </v-text-field>
                              </template>
                              <v-date-picker :model-value="[dayjs(placeholder.value).toDate()]" :title="placeholder.name"
                                @update:model-value="$v => placeholder.value = dayjs($v[0]).toISOString()"></v-date-picker>
                            </v-menu>
                          </template>
                          <v-text-field v-else :ref="el => setRefMap(el, placeholder.id)" density="compact" hide-details
                            :placeholder="`请输入${placeholder.name}`" clearable v-model="placeholder.value"
                            @update:model-value="$v => placeholderUpdate($v, placeholder)">
                            <template v-slot:prepend>
                              <v-icon icon="mdi-drag-vertical" size="large"></v-icon>
                            </template>
                            <template v-slot:prepend-inner>
                              <v-chip label :variant="!!placeholder.value ? 'elevated' : 'tonal'"
                                :color="!!placeholder.value ? 'success' : 'grey'"><v-icon start
                                  :icon="{ text: 'mdi-text', number: 'mdi-numeric', date: 'mdi-calendar' }[placeholder.type]"></v-icon>{{
                                    placeholder.name }}</v-chip>
                            </template>
                            <v-tooltip :disabled="!placeholder.value" activator="parent" location="right">{{
                              placeholder.value }}</v-tooltip>
                          </v-text-field>
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-col>
                </v-row>
                <!-- <v-main> -->
                <!-- <DocumentEditor v-if="config.document" :id="docEditorId" :document-server-url="documentServerApiUrl"
                    :config="config" :events_on-app-ready="onAppReady" :events_on-document-ready="onDocumentReady"
                    :on-load-component-error="onLoadComponentError" /> -->
                <!-- </v-main> -->
              </v-layout>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { DocumentEditor, IConfig } from '@onlyoffice/document-editor-vue'
import { SessionWrapper, Template, WorkData, Placeholder, PlaceholderType } from '~/index';
import { VDatePicker } from 'vuetify/labs/VDatePicker'
import { queue } from 'async-es'
import { throttle } from 'lodash-es'
const { documentServerApiUrl } = useRuntimeConfig().public
const zoom = ref(100)
// const expand = useTemplateExpanded()
// const pinned = usePlaceholderPinned()
const panels = ref(['bc', 'tpl'])
const props = defineProps<{ data: WorkData }>()
const businessCategoryOptions = ref([])
const tab = ref(0)
const { data: session } = useAuth()
// type Connector = { executeMethod: (arg0: string, arg1: [any] | null, arg2: Function) => void }
// const connector = ref({} as Connector)
// const config = ref({} as IConfig)
type refItem = Element | ComponentPublicInstance | null
const refMap: Record<string, refItem> = {}
// console.log('config', config.value.document)
onMounted(() => {
  $fetch('/api/businessCategories').then((data) => {
    businessCategoryOptions.value = data
  })
})
watch(() => props.data.businessCategory, (newVal) => {
  // fetch templates data with newVal
  console.log('businessCategory changed.')
})
const emit = defineEmits(['update:config'])
watch(() => props.data.id, () => {
  emit('update:config', props.data.templates[tab.value || 0])
})
watch(tab, async (newVal) => {
  emit('update:config', props.data.templates[newVal || 0])
  // await getConfig(props.data.templates[newVal || 0]).then(data => {
  //   console.log('documentConfig', data)
  //   config.value = data as any
  // })
}, {
  immediate: true
})

// 每个replacementTab共享一个docEditorId
const docEditorId = computed(() => {
  return `docEditor-${props.data.id}`
})

// method
function setRefMap(el: refItem, name: string) {
  if (el) {
    refMap[name] = el
  }
}
const placeholderUpdate = throttle(($v: string, placeholder: Placeholder) => doSyncContent(placeholder), 500, { leading: false })
function doSyncContent(placeholder: Placeholder) {
  window.connector.value.executeMethod("GetAllContentControls", null, function (data: any) {
    //console.log(ctrls);
    for (var ctrl of data) {
      //console.log(ctrl.InternalId);
      if (ctrl.Tag === placeholder.id) {
        const doc = [{
          "Props": {
            "InternalId": ctrl.InternalId
          },
          "Script": `var oParagraph = Api.CreateParagraph();oParagraph.AddText("${placeholder.value}");Api.GetDocument().InsertContent([oParagraph], true, {KeepTextOnly: true});`
        }];
        q.push({ doc });
      }
    }
  });
}

var q = queue(function ({ doc }: any, callback: Function) {
  console.log('hello ' + doc);
  window.connector.value.executeMethod("InsertAndReplaceContentControls", [doc], callback);
}, 1);
q.drain(function () {
  console.log('all items have been processed');
});
// function onAppReady() {
//   console.log('OnlyOffice is Ready')
// }
// function onDocumentReady() {
//   connector.value = window.DocEditor.instances[docEditorId.value].createConnector()
//   console.log("Document is loaded");
// }
// function onLoadComponentError(errorCode: number, errorDescription: string) {
//   console.error(errorCode, errorDescription)
// }
// async function getConfig(template: Template) {
//   const { data: config } = await useFetch('/api/doc/config', {
//     query: {
//       zoom: zoom, title: template.name, url: template.path, mode: 'edit'
//     }
//   })
//   return config.value
// }

</script>
