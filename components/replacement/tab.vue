<template>
  <v-layout style="height: calc(100dvh - 338px);">
    <v-row>
      <v-col class="d-flex flex-row">
        <!-- <v-tabs v-model="tab" ref="templateTabs" direction="vertical" align-with-title>
          <v-tab v-for="{ id, name } in templates" :key="id">
            <v-icon size="large" start>mdi-home</v-icon>
            <span class="text-h6">{{ name }}</span>
          </v-tab>
        </v-tabs> -->
        <v-navigation-drawer :rail="templateListRailed" floating @click="templateListRailed = false" permanent>
          <v-list v-model:selected="selectedTemplateIndex" style="max-width: 255px" class="text-truncate" color="primary"
            mandatory>
            <v-list-item title="模板" class="pr-0" density="comfortable">
              <template v-slot:prepend>
                <v-icon color="primary">mdi-file-document-multiple-outline</v-icon>
              </template>
              <template v-slot:append>
                <v-tooltip>
                  <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-chevron-left" variant="text" density="compact"
                      @click.stop="templateListRailed = !templateListRailed">
                    </v-btn>
                  </template>
                  <span>收起</span>
                </v-tooltip>
              </template>
            </v-list-item>
            <v-divider class="my-2"></v-divider>
            <v-list-item v-for="({ id, name }, idx) in templates" :value="idx" :key="id" density="compact">
              <template v-slot:prepend>
                <v-icon size="large"
                  :icon="idx < 10 ? `mdi-numeric-${idx + 1}-box` : idx < 36 ? `mdi-alpha-${String.fromCharCode(idx + 87)}-box` : 'mdi-blank'"
                  start></v-icon>
              </template>
              <v-list-item-title><span class="text-h6">{{ name }}</span></v-list-item-title>
            </v-list-item>
          </v-list>
        </v-navigation-drawer>
        <v-main>
          <v-list density="comfortable" class="mx-auto">
            <v-list-item title="占位符">
              <template v-slot:prepend>
                <v-icon color="orange">mdi-bookmark-multiple-outline</v-icon>
              </template>
            </v-list-item>
            <v-divider class="my-2"></v-divider>
            <v-list-item v-if="templates" v-for="placeholder in templates[selectedTemplateIndex[0]].placeholders"
              :key="placeholder.id">
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
        </v-main>
      </v-col>
    </v-row>
  </v-layout>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { SessionWrapper, Template, WorkData, Placeholder, PlaceholderType } from '~/index';
import { VDatePicker } from 'vuetify/labs/VDatePicker'
import { queue } from 'async-es'
import { throttle } from 'lodash-es'
import { useSelectedTemplate, useTemplateRailed } from '#imports'
const zoom = ref(100)
// const selectedBusinessCategory = ref({} as { selected: { icon: string; name: string } | null })
const panels = ref(['bc', 'tpl'])
const selectedTemplateIndex = ref([0])
const templateListRailed = ref(true)
const props = defineProps<{ id: string, templates: Template[] | null }>()
const businessCategoryOptions = ref([])
const emit = defineEmits([
  // 'update:businessCategory',
  'update:config'
])
// const businessCategory = computed({
//   get() {
//     return props.businessCategory
//   },
//   set(val) {
//     emit('update:businessCategory', val)
//   }
// })
// const tab = ref(0)
type refItem = Element | ComponentPublicInstance | null
const refMap: Record<string, refItem> = {}
onMounted(() => {
  selectedTemplateIndex.value = [useSelectedTemplate(props.id).value]
  templateListRailed.value = useTemplateRailed().value
  $fetch('/api/businessCategories').then((data) => {
    businessCategoryOptions.value = data
  })
})
watch(() => props.id, (val) => {
  console.log('当替换标签页切换时', val)
  selectedTemplateIndex.value = [useSelectedTemplate(val).value]
  emit('update:config', props.templates![selectedTemplateIndex.value[0] || 0])
})
watch(selectedTemplateIndex, async (val) => {
  console.log('当模板菜单切换时', val)
  useSelectedTemplate(props.id).value = val[0]
  emit('update:config', props.templates![val[0] || 0])
}, {
  immediate: true
})

watch(templateListRailed, val => {
  useTemplateRailed().value = val
})

// 每个replacementTab共享一个docEditorId
const docEditorId = computed(() => {
  return `docEditor-${props.id}`
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
</script>
