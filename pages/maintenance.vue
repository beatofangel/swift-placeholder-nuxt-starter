<template>
  <v-container fluid>
    <v-layout class="d-flex flex-column px-2" v-scroll="onScroll" v-resize="onResize">
      <v-row key="businessCategory">
        <v-col>
          <!-- <v-card id="businessCategory" class="mb-2"> -->
            <BusinessCategoryList id="businessCategory" ref="businessCategory" class="mb-2" :visible="true"></BusinessCategoryList>
          <!-- </v-card> -->
        </v-col>
      </v-row>
      <v-row key="template">
        <v-col>
          <!-- <v-card id="businessCategory" class="mb-2"> -->
            <TemplateList id="template" ref="template" class="mb-2" :bcId="businessCategory.selected?.id" :visible="true"></TemplateList>
          <!-- </v-card> -->
        </v-col>
      </v-row>
      <v-row key="placeholder">
        <v-col>
          <!-- <v-card id="businessCategory" class="mb-2"> -->
            <PlaceholderList id="placeholder" class="mb-2" :tpl="template.selected" :visible="true"></PlaceholderList>
          <!-- </v-card> -->
        </v-col>
      </v-row>
      <!-- <v-row v-for="item in itemsDummy" :key="item.id">
        <v-col>
          <v-card :id="item.id" class="mb-2">
            <v-toolbar class="pl-4" :color="tab == item.title ? 'primary' : ''">
              <v-icon start :icon="item.prependIcon"></v-icon>
              {{ item.title }}
            </v-toolbar>
            <v-card-text style="height: 400px;" :class="`text-${item.color}`"
              class="d-flex justify-center text-h1 text-weight-black my-10">{{ item.title }}</v-card-text>
          </v-card>
        </v-col>
      </v-row> -->
    </v-layout>
    <v-navigation-drawer permanent location="right">
      <v-list>
        <v-tabs v-model="tab" color="primary" direction="vertical">
          <v-tab v-for="item in items" :value="item.id" :key="item.id" @click="selectTab(item)">
            <v-icon :icon="item.prependIcon" start></v-icon>{{ item.title }}{{ menuSuffix[item.id] }}
          </v-tab>
        </v-tabs>
      </v-list>
      <v-divider></v-divider>
      <v-list>
        <v-list-item> {{ }} </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-container>
</template>

<script setup lang="ts">
import { Item } from 'components/common/table';
import { pick, throttle } from 'lodash-es'
export interface CommonTableSelectedItem { selected: (Item & { path: string, placeholders: [] }) | undefined }
// import { useToast } from 'vue-toastification';
definePageMeta({
  // middleware: ['casbin'],
  icon: "mdi-text-box-edit",
  index: 2
});
const businessCategory = ref({} as CommonTableSelectedItem)
const template = ref({} as CommonTableSelectedItem)

let timer: NodeJS.Timer
const itemsDummy = ref([
  { title: 'twitter', id: 'twitter', prependIcon: 'mdi-twitter', color: 'info' },
  { title: 'google', id: 'google', prependIcon: 'mdi-google', color: 'error' },
  { title: 'facebook', id: 'facebook', prependIcon: 'mdi-facebook', color: 'info' },
  { title: 'youtube', id: 'youtube', prependIcon: 'mdi-youtube', color: 'error' },
  { title: 'linkedin', id: 'linkedin', prependIcon: 'mdi-linkedin', color: 'info' },
])
const items = ref([
  { title: '业务分类', id: 'businessCategory', prependIcon: 'mdi-family-tree' },
  { title: '模板', id: 'template', prependIcon: 'mdi-file-document-multiple-outline' },
  { title: '占位符', id: 'placeholder', prependIcon: 'mdi-bookmark-multiple-outline' },
  // ...itemsDummy.value
])
const menuSuffix: ComputedRef<Record<string, string | undefined>> = computed(() => {
  return {
    businessCategory: `${businessCategory.value.selected ? ` - ${businessCategory.value.selected.name}` : ''}`,
    template: `${template.value.selected ? ` - ${template.value.selected.name}` : ''}`
  }
})
const tab = ref('')
const offset = 0
const onScrollLock = ref(false)
const threshold = ref(0)
const onScroll = throttle(() => {
  if (onScrollLock.value) return
  items.value.forEach(item=>{
    const top = (document.querySelector(`#${item.id}`) as Element).getBoundingClientRect().top
    if (top <= threshold.value && top > 0) tab.value = item.id
  })
}, 50)
const onResize = throttle(() => {
  threshold.value = window.innerHeight * 0.4
}, 50)
onMounted(() => {
  threshold.value = window.innerHeight * 0.4
  // onScroll()
  // useToast().success(`Hello world!`)
})
onUnmounted(() => {
  clearTimeout(timer)
})
const selectTab = (item: { id: any; }) => {
  clearTimeout(timer)
  onScrollLock.value = true
  const top = (document.querySelector(`#${item.id}`) as HTMLElement).offsetTop
  window.scrollTo({
    top: top - offset,
    left: 0,
    behavior: 'smooth'
  })
  timer = setTimeout(() => {
    onScrollLock.value = false
  }, 600);
}
</script>

