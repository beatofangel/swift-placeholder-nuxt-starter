<template>

  <v-card>
    <v-toolbar class="pl-4" color="primary">
      <v-icon start>mdi-format-list-bulleted</v-icon>
      <span class="text-h5 ml-1 mt-1">模板</span>
      <!-- <v-spacer></v-spacer>
      <v-btn @click="onClose" fab plain small>
        <v-icon>mdi-close</v-icon>
      </v-btn> -->
    </v-toolbar>
    <v-row class="ma-0">
      <v-col class="pa-0">
        <v-card elevation="0" tile>
          <v-card-text class="d-flex flex-nowrap pa-2">
            <CommonTable
              ref="innerTemplateCommonTable"
              style="width: 100%;"
              height="576"
              hide-title
              hide-select-btn
              flat
              :condition="bcId ? { bcId } : undefined"
              api="/api/templates"
              :headers="templateHeaders"
              title="模板"
              visible
              show-select
              cascade
              cascaded-id="bcId"
              draggable
              show-index
              fixed-header
              :hide-create="!bcId"
              @selectionChange="(val) => selectionChangeHandler(val)"
              @change="changeHandler"
            >
              <template v-slot:[`item.path`]="{ item }">
                <v-tooltip :text="`下载 ${item.name}.docx`">
                  <template v-slot:activator="{ props }">
                    <a v-bind="props" class="text-decoration-none text-grey" :href="item.path" :download="`${item.name}.docx`"><v-icon icon="mdi-download"></v-icon></a>
                  </template>
                </v-tooltip>
              </template>
              <template
                v-slot:editor="props"
              >
                <TemplateDetail
                  v-bind="props"
                ></TemplateDetail>
              </template>
            </CommonTable>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { Item } from 'components/common/table';
import { Template } from 'index';

const props = defineProps({
  bcId: String
})
watch(() => props.bcId, (val) => {
  selected.value = undefined
})
const innerTemplateCommonTable = ref<{items: Template[]}>()
const selected = ref<Item | undefined>()
const emits = defineEmits({
  'change': () => true,
})
const templateHeaders = [{
    title: "名称",
    key: "name",
    class: "text-center",
    cellClass: "nameClass text-center text-truncate ",
  },
  {
    title: "文档",
    key: "path",
    class: "text-center",
    cellClass: "text-center text-truncate ",
    style: "min-width: 64px;"
  },
  {
    title: "所属业务",
    key: "bcName",
    class: "text-center",
    cellClass: "nameClass text-center text-truncate ",
  },
]

defineExpose({
  selected: selected
})

const selectionChangeHandler = (item: Item | undefined) => {
  // tplId.value = item ? item.id : undefined
  selected.value = item
}
const changeHandler = () => {
  console.log('changeHandler')
  selected.value = innerTemplateCommonTable.value?.items.find(item => item.select)
  emits('change');
}
</script>
