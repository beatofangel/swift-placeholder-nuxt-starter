<template>
  <v-card>
    <v-toolbar class="pl-4" color="primary">
      <v-icon start>mdi-format-list-bulleted</v-icon>
      <span class="text-h5 ml-1 mt-1">业务分类</span>
      <!-- <v-spacer></v-spacer>
      <v-btn @click="onClose" fab plain small>
        <v-icon>mdi-close</v-icon>
      </v-btn> -->
    </v-toolbar>
    <v-row class="ma-0">
      <v-col v-for="level in 3" cols="4" :key="level" class="pa-0">
        <v-card elevation="0" tile>
          <v-card-text class="d-flex flex-nowrap pa-2">
            <CommonList
              style="width: 100%;"
              height="576"
              hide-tool-bar
              flat
              :api="{
                get: '/api/v1/businesscategories/{1}/businesscategories',
                post: '/api/v1/businesscategories/{1}/businesscategories',
                put: '/api/v1/businesscategories/{1}',
                delete: '/api/v1/businesscategories/{1}/businesscategories/{2}',
                sort: '/api/v1/businesscategories/{1}/businesscategories/sort',
              }"
              :title="getCategoryName(level)"
              :headers="categoryHeaders"
              :visible="visible"
              show-select
              cascade
              :cascaded-id="conditions[level - 1]?.pid"
              draggable
              show-index
              fixed-header
              :hide-create="level > 1 && !businessCategories[level - 2]"
              @selectionChange="(val) => selectionChangeHandler(val, level)"
              @change="changeHandler"
            >
              <template v-slot:[`item.icon`]="{ item }">
                <v-icon color="accent">{{
                  item ? item.icon : "item 未定义"
                }}</v-icon>
              </template>
              <template
                v-slot:editor="props"
              >
                <BusinessCategoryDetail
                  v-bind="props"
                ></BusinessCategoryDetail>
              </template>
            </CommonList>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { Item } from 'components/common/list';

interface condition extends Record<string, any> { pid: string }

const props = defineProps({
  visible: Boolean
})
const emits = defineEmits({
  'close': (val: boolean) => true,
  'change': () => true,
})
const businessCategories = ref([ undefined, undefined, undefined ] as (Item | undefined)[])
const selected = ref<Item | {}>()
const { dummyRootId } = useRuntimeConfig().public
const conditions = ref([{ pid: dummyRootId }, undefined, undefined] as (condition | undefined)[])
const categoryHeaders = ref([
  {
    title: "名称",
    key: "name",
    class: "text-center",
    cellClass: "nameClass text-center text-truncate ",
  },
  {
    title: "图标",
    key: "icon",
    class: "text-center",
    cellClass: "text-center",
    style: "min-width: 64px;"
  },
])

defineExpose({
  selected: selected
})

// const onClose = () => {
//   emits("close", false);
// }
const getCategoryName = (level: number) => {
  return `${["一", "二", "三"][level - 1]}级业务分类`;
}
const changeHandler = () => {
  console.log('changeHandler')
  emits('change');
}
const selectionChangeHandler = (item: Item | undefined, level: number) => {
  if (item) {
    console.log("selectionChangeHandler", level, item.id);
    businessCategories.value[level - 1] = item;
    conditions.value[level] = {
      pid: item.id!,
    }
    for (let i = level + 1; i < 3; i++) {
      conditions.value[i] = undefined
    }
    for (let i = level; i < 3; i++) {
      businessCategories.value[i] = item;
    }
  } else {
    for (let i = level; i < 3; i++) {
      conditions.value[i] = undefined
    }
    for (let i = level - 1; i < 3; i++) {
      businessCategories.value[i] = undefined;
    }
  }
  selected.value = businessCategories.value.findLast(item=>!!item)
}
</script>

<style>
/* .nameClass {
  max-width: 142px;
}
.iconClass {
  min-width: 48px;
}
.actionsClass {
  min-width: 64px;
} */
</style>
