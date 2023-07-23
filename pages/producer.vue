<template>
  <v-container fluid>
    <v-layout class="d-flex flex-column" v-scroll="onScroll" v-resize="onResize">
      <v-row key="businessCategory">
        <v-col>
          <!-- <v-card id="businessCategory" class="mb-2"> -->
            <business-category-list id="businessCategory" class="mb-2" :visible="true"></business-category-list>
          <!-- </v-card> -->
        </v-col>
      </v-row>
      <v-row v-for="item in itemsDummy" :key="item.id">
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
      </v-row>
    </v-layout>
    <v-navigation-drawer permanent location="right">
      <v-list>
        <v-tabs v-model="tab" color="primary" direction="vertical">
          <v-tab v-for="item in items" :value="item.id" :key="item.id" @click="selectTab(item)">
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
import { useToast } from 'vue-toastification';
definePageMeta({
  // middleware: ['casbin'],
  icon: "mdi-text-box-edit",
  index: 2
});
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
  ...itemsDummy.value
])
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
  // useToast().success(`Hello world!`, { position: POSITION.TOP_CENTER })
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

