<template>
  <v-layout>
    <v-main style="height: 100dvh;">
      <v-container class="bg-grey fill-height" fluid>
        <!-- <v-text-field v-model="username"></v-text-field>
      <v-text-field type="password" v-model="password"></v-text-field>
      <v-btn @click="signIn('credentials', {username, password})">login</v-btn> -->
        <CommonLogin width="1000" height="650" class="d-flex justify-center"></CommonLogin>
      </v-container>
      <CommonFooter></CommonFooter>
    </v-main>
  </v-layout>
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

<style scoped>
.v-container::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100dvw;
  height: 100dvh;
  filter: blur(4px);
  background-image: url("/background-2.jpg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
