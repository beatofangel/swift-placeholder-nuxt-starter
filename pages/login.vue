<template>
  <v-app>
    <v-container class="bg-grey fill-height" fluid>
      <!-- <v-text-field v-model="username"></v-text-field>
      <v-text-field type="password" v-model="password"></v-text-field>
      <v-btn @click="signIn('credentials', {username, password})">login</v-btn> -->
      <CommonLogin width="1000" height="650" class="d-flex justify-center"></CommonLogin>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
// const { signIn } = useAuth()
definePageMeta({
  layout: false,
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
  invisible: true
})
// const username = ref('')
// const password = ref('')
</script>
