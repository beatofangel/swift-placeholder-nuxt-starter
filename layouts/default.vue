<template>
  <v-layout>
    <v-app-bar flat>
      <template v-slot:prepend>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
      </template>
      <v-app-bar-title>Swift Placeholder</v-app-bar-title>
      <template v-slot:append>
        <template v-if="status === 'authenticated'">
          <v-avatar :color="!!data?.user?.image ? '' : 'primary'">
            <v-img v-if="data?.user?.image" :src="data?.user?.image"></v-img>
            <span v-else>{{ data?.user?.name?.charAt(0).toUpperCase() }}</span>
          </v-avatar>
          <span class="mx-4">{{ data?.user?.name }}</span>
          <v-menu v-model="menu" :close-on-content-click="false">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" size="small" rounded density="comfortable" variant="text"
                icon="mdi-menu-down"></v-btn>
            </template>
            <v-list density="compact">
              <v-list-item v-for="(item, i) in items" :key="i" :value="item" color="primary" min-height="24"
                @click="menuClickWrapper(item.click)">
                <template v-slot:prepend>
                  <v-icon :color="item.prepend.color" :icon="item.prepend.icon"></v-icon>
                </template>
                <v-list-item-title v-text="item.text"></v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
        <template v-else>
          <v-tooltip text="登录" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" density="comfortable" prepend-icon="mdi-login" variant="text" color="primary"
                @click="navigateTo('/')">
                登录
              </v-btn>
            </template>
          </v-tooltip>
        </template>
      </template>
    </v-app-bar>
    <Menu></Menu>
    <v-main style="height: 100dvh;">
      <slot></slot>
    </v-main>
    <Watermark />
  </v-layout>
</template>

<script setup lang="ts">
const { data, signOut, status } = useAuth()
const menu = ref(false)
const items = ref([
  { text: '个人资料', prepend: { icon: 'mdi-account-box', color: 'primary' } },
  { text: '退出', prepend: { icon: 'mdi-logout', color: 'error' }, click: () => signOut({ callbackUrl: '/login' }) }
])
function menuClickWrapper(e: Function | undefined) {
  (e || (() => menu.value = false))()
}
</script>
