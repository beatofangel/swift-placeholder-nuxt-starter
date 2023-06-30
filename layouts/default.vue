<template>
  <v-app>
  <v-layout>
    <v-app-bar>
      <template v-slot:prepend>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
      </template>
      <v-app-bar-title>Swift Placeholder</v-app-bar-title>
      <template v-slot:append>
        Hello, {{ data?.user?.name }}
        <v-btn icon="mdi-logout" density="comfortable" color="error"
          @click="signOut({ callbackUrl: '/login' })"></v-btn>
      </template>
    </v-app-bar>
    <Menu></Menu>
    <v-main>
      <slot></slot>
    </v-main>
    <Watermark />
  </v-layout>
</v-app>
</template>

<script setup lang="ts">
const { data, signOut } = useAuth()
</script>
