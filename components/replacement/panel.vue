<template>
  <v-layout>
    <v-row>
      <v-col class="d-flex flex-row">
        <v-navigation-drawer :rail="templateListRailed" @click="templateListRailed = false" permanent>
          <v-list v-model:selected="selectedTemplateIndex" style="max-width: 255px;" class="text-truncate" color="primary"
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
          <v-list density="comfortable" style="height: calc(100dvh - 310px);" class="mx-auto">
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
                        v-bind="props" :placeholder="`请输入${placeholder.name}`" clearable :disabled="!placeholder.sync"
                        :value="dayjs(placeholder.value).format(placeholder.format)" readonly>
                        <template v-slot:prepend>
                          <v-icon icon="mdi-drag-vertical" size="large"></v-icon>
                        </template>
                        <template v-slot:prepend-inner>
                          <v-chip label :variant="!!placeholder.value ? 'elevated' : 'tonal'"
                            :color="!!placeholder.value ? 'success' : 'grey'"><v-icon start
                              :icon="{ text: 'mdi-text', number: 'mdi-numeric', date: 'mdi-calendar' }[placeholder.type]"></v-icon>{{
                                `${placeholder.name}${placeholder.count > 1 ? `x${placeholder.count}` : ''}` }}</v-chip>
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
                  :disabled="!placeholder.sync" @update:model-value="$v => placeholderUpdate($v, placeholder)">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-drag-vertical" size="large"></v-icon>
                  </template>
                  <template v-slot:prepend-inner>
                    <v-chip label :variant="!!placeholder.value ? 'elevated' : 'tonal'"
                      :color="!!placeholder.value ? 'success' : 'grey'"><v-icon start
                        :icon="{ text: 'mdi-text', number: 'mdi-numeric', date: 'mdi-calendar' }[placeholder.type]"></v-icon>{{
                          `${placeholder.name}${placeholder.count > 1 ? `x${placeholder.count}` : ''}` }}</v-chip>
                  </template>
                  <v-tooltip :disabled="!placeholder.value" activator="parent" location="right">{{
                    placeholder.value }}</v-tooltip>
                </v-text-field>
              </v-list-item-title>
            </v-list-item>
            <v-card variant="text">
              <v-card-text>
                <v-fade-transition group mode="in-out">
                  <template v-for="(docWarning, index) in docWarnings" :key="index">
                    <v-alert v-if="!docWarning.ignore" class="my-2" border="start" density="compact" variant="tonal" closable type="warning" :title="docWarning.title" elevation="1" @click:close="docWarning.ignore=true">
                      <template v-slot:text>
                        <div v-for="p in docWarning.text">
                          {{ p }}
                        </div>
                      </template>
                    </v-alert>
                  </template>
                </v-fade-transition>
              </v-card-text>
            </v-card>
          </v-list>
        </v-main>
      </v-col>
    </v-row>
  </v-layout>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import type { Template, Placeholder, DocWarning } from '~/index';
import { VDatePicker } from 'vuetify/labs/VDatePicker'
import { debounce } from 'lodash-es'
const selectedTemplateIndex = ref([0])
const templateListRailed = ref(true)
const props = defineProps<{ id: string, templates: Template[] | null }>()
// const businessCategoryOptions = ref([])
const docWarnings = ref([] as DocWarning[])
const emit = defineEmits([
  // 'update:businessCategory',
  'update:config'
])
type refItem = Element | ComponentPublicInstance | null
const refMap: Record<string, refItem> = {}
onMounted(() => {
  selectedTemplateIndex.value = [useSelectedTemplate(props.id).value]
  templateListRailed.value = useTemplateRailed().value
  // $fetch('/api/businessCategories', {
  // $fetch('/api/businesscategories', {
  //   query: {
  //     cascaded: true
  //   }
  // }).then((data) => {
  //   if (data.success) {
  //     businessCategoryOptions.value = data
  //   } else {
  //     console.log(data.errorMessage)
  //   }
  // })
})
watch(() => props.id, (val) => {
  console.log('当替换标签页切换时', val)
  selectedTemplateIndex.value = [useSelectedTemplate(val).value]
  // 手动触发
  onSelectedTemplateChanged(selectedTemplateIndex.value[0])
  // emit('update:config', props.templates![selectedTemplateIndex.value[0] || 0])
})
const onSelectedTemplateChanged = (val: number) => {
  console.log('当模板菜单切换时', val)
  docWarnings.value.splice(0) // 重置警告
  useSelectedTemplate(props.id).value = val
  emit('update:config', props.templates![val || 0])
}
watch(() => selectedTemplateIndex.value[0], onSelectedTemplateChanged, {
  immediate: true
})

watch(templateListRailed, val => {
  useTemplateRailed().value = val
})

// watch(props.templates![selectedTemplateIndex.value[0]].placeholders, val => {
//   console.log(val)
// })

const placeholders = computed({
  get() {
    return props.templates![selectedTemplateIndex.value[0]].placeholders
  },
  set(val) {
    props.templates![selectedTemplateIndex.value[0]].placeholders = val
  }
})

defineExpose({ placeholders, docWarnings })

// method
function setRefMap(el: refItem, name: string) {
  if (el) {
    refMap[name] = el
  }
}
const placeholderUpdate = debounce(($v: string, placeholder: Placeholder) => useDocumentHelper().value.writeContentControl(placeholder), 300, { leading: false })

</script>
