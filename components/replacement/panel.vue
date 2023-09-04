<template>
  <v-layout>
    <v-row>
      <v-col class="d-flex flex-row">
        <v-navigation-drawer :rail="templateListRailed" @click="templateListRailed = false" permanent>
          <!-- 模板 -->
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
          <!-- 占位符 -->
          <v-list density="comfortable" style="height: calc(100dvh - 310px);" class="mx-auto">
            <v-list-item title="占位符">
              <template v-slot:prepend>
                <v-icon color="orange">mdi-bookmark-multiple-outline</v-icon>
              </template>
            </v-list-item>
            <v-divider class="my-2"></v-divider>
            <v-list height="calc(100dvh - 380px)" class="overflow-y-auto">
              <v-list-item v-if="templates && templates.length > 0" v-for="placeholder in templates[selectedTemplateIndex[0]]?.placeholders"
                :key="placeholder.id">
                <v-list-item-title>
                  <template v-if="placeholder.type === 'date'">
                    <v-menu location="bottom" :close-on-content-click="false" :offset="[20, 88]">
                      <template v-slot:activator="{ props }">
                        <v-text-field :ref="el => setRefMap(el, placeholder.id)" density="compact" hide-details
                          v-bind="props" :placeholder="`请输入${placeholder.name}`" clearable :disabled="!placeholder.sync"
                          :value="placeholder.value">
                          <!-- <template v-slot:prepend>
                            <v-icon icon="mdi-drag-vertical" size="large"></v-icon>
                          </template> -->
                          <template v-slot:prepend-inner>
                            <v-chip label :variant="!!placeholder.value ? 'elevated' : 'tonal'"
                              :color="!!placeholder.value ? 'success' : 'grey'"><v-icon start
                                :icon="{ text: 'mdi-text', number: 'mdi-numeric', date: 'mdi-calendar' }[placeholder.type]"></v-icon>{{
                                  `${placeholder.name}${placeholder.count > 1 ? `x${placeholder.count}` : ''}` }}</v-chip>
                          </template>
                          <v-tooltip :disabled="!placeholder.value" activator="parent" location="right">{{
                            placeholder.value }}</v-tooltip>
                        </v-text-field>
                      </template>
                      <v-date-picker :model-value="[dayjs(placeholder.value, placeholder.format).toDate()]" :title="placeholder.name" :format="placeholder.format"
                        @update:model-value="$v => {
                          placeholder.status = 1 // modified
                          placeholder.value = dayjs($v[0]).format(placeholder.format)
                          placeholderUpdate('', placeholder)
                        }"></v-date-picker>
                    </v-menu>
                  </template>
                  <v-text-field v-else :ref="el => setRefMap(el, placeholder.id)" density="compact" hide-details
                    :placeholder="`请输入${placeholder.name}`" clearable v-model="placeholder.value"
                    :disabled="!placeholder.sync" @update:model-value="$v => {
                      placeholder.status = 1 // modified
                      placeholderUpdate($v, placeholder)
                    }">
                    <!-- <template v-slot:prepend>
                      <v-icon icon="mdi-drag-vertical" size="large"></v-icon>
                    </template> -->
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
            </v-list>
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
import type { Template, Placeholder, DocWarning } from '~/index';
import { VDatePicker } from 'vuetify/labs/VDatePicker'
import { debounce } from 'lodash-es'
const dayjs = useDayJS()

const selectedTemplateIndex: Ref<number[]> = ref([])
const templateListRailed = ref(true)
const props = defineProps<{ id: string, bcId: string | null, templates: Template[] | null }>()
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
  // onSelectedTemplateChanged(selectedTemplateIndex.value[0], true)
})

const onSelectedTemplateChanged = (val: number) => {
  console.log('当模板菜单切换时', val)
  docWarnings.value.splice(0) // 重置警告
  useSelectedTemplate(props.id).value = val
  props.templates && props.templates.length > 0 && emit('update:config', props.templates[val || 0])
}

// watch(() => props.bcId, (val) => {
//   console.log('监视：业务分类', val)
//   if (!val) {
//     useSelectedTemplate(props.id).value = 0
//   }
//   selectedTemplateIndex.value = [useSelectedTemplate(props.id).value]
//   docWarnings.value.splice(0) // 重置警告
//   props.templates && props.templates.length > 0 && emit('update:config', props.templates[selectedTemplateIndex.value[0]])
// }, {
//   immediate: true
// })

watch(() => selectedTemplateIndex.value[0], (val) => {
  console.log('监视：模板菜单', val)
  onSelectedTemplateChanged(val)
}, {
  immediate: true
})

watch(templateListRailed, val => {
  useTemplateRailed().value = val
})

const triggerSelectedTemplateChanged = () => {
  selectedTemplateIndex.value = [useSelectedTemplate(props.id).value]
  onSelectedTemplateChanged(selectedTemplateIndex.value[0])
}

const placeholders = computed({
  get() {
    return props.templates![selectedTemplateIndex.value[0]].placeholders
  },
  set(val) {
    props.templates![selectedTemplateIndex.value[0]].placeholders = val
  }
})

defineExpose({ placeholders, docWarnings, triggerSelectedTemplateChanged })

// method
function setRefMap(el: refItem, name: string) {
  if (el) {
    refMap[name] = el
  }
}
const placeholderUpdate = debounce(($v: string, placeholder: Placeholder) => useDocumentHelper().value.writeContentControl(placeholder), 300, { leading: false })

</script>
