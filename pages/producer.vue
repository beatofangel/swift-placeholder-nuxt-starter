<template>
  <v-container fluid>
    <v-layout class="d-flex flex-column" v-scroll="onScroll" v-resize="onResize">
      <v-row>
        <v-col>
          <v-card>
            <!-- <business-category-list :visible="true"></business-category-list> -->
            <CommonTable model="/api/businesscategories" :headers="dummyHeaders" :condition="{ pid: '' }" :visible="true"></CommonTable>
          </v-card>
        </v-col>
      </v-row>
      <v-row v-for="(item, idx) in items" :key="idx">
        <v-col>
          <v-card :id="item.title" class="mb-2">
            <v-toolbar class="pl-4" :color="tab == item.title ? 'primary' : ''">
              <v-icon start :icon="item.prependIcon"></v-icon>
              {{ item.title }}
            </v-toolbar>
            <v-card-text style="height: 400px;" :class="`text-${item.color}`"
              class="d-flex justify-center text-h1 text-weight-black my-10">{{ item.title }}</v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-layout>
    <v-navigation-drawer permanent location="right">
      <v-list>
        <v-tabs v-model="tab" color="primary" direction="vertical">
          <v-tab v-for="(item, idx) in items" :value="item.title" :key="idx" @click="selectTab(item)">
            <v-icon :icon="item.prependIcon" start></v-icon>{{ item.title }}
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
import { throttle } from 'lodash-es'
import { POSITION, useToast } from 'vue-toastification';
definePageMeta({
  // middleware: ['casbin'],
  icon: "mdi-text-box-edit",
  index: 2
});
let timer: NodeJS.Timer
const items = ref([
  { title: 'twitter', prependIcon: 'mdi-twitter', color: 'info' },
  { title: 'google', prependIcon: 'mdi-google', color: 'error' },
  { title: 'facebook', prependIcon: 'mdi-facebook', color: 'info' },
  { title: 'youtube', prependIcon: 'mdi-youtube', color: 'error' },
  { title: 'linkedin', prependIcon: 'mdi-linkedin', color: 'info' },
])
const tab = ref('')
const offset = 0
const onScrollLock = ref(false)
const threshold = ref(0)
const onScroll = throttle(() => {
  if (onScrollLock.value) return
  items.value.forEach(item=>{
    const top = (document.querySelector(`#${item.title}`) as Element).getBoundingClientRect().top
    if (top <= threshold.value && top > 0) tab.value = item.title
  })
}, 50)
const onResize = throttle(() => {
  threshold.value = window.innerHeight * 0.4
}, 50)
const dummyHeaders = ref([
        {
          title: "No.",
          key: "index",
        },
        {
          title: "名称",
          key: "name",
          class: "nameClass",
          cellClass: "nameClass text-truncate ",
        },
        {
          title: "图标",
          key: "icon",
          class: "iconClass",
        },
        {
          title: "操作",
          key: "actions",
          class: "actionsClass",
          align: "center",
        },
      ])
onMounted(() => {
  threshold.value = window.innerHeight * 0.4
  onScroll()
  useToast().success(`Hello world!`, { position: POSITION.TOP_CENTER })
})
onUnmounted(() => {
  clearTimeout(timer)
})
const selectTab = (item: { title: any; }) => {
  clearTimeout(timer)
  onScrollLock.value = true
  const top = (document.querySelector(`#${item.title}`) as HTMLElement).offsetTop
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

