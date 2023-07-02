<template>
  <v-container class="bg-grey fill-height" fluid>
    <v-card class="mx-auto" color="transparent" flat width="100%">
      <v-card-text>
        <v-row>
          <v-col>
            <div class="text-h1 d-flex justify-center">Welcome to Swift Placeholder!</div>
          </v-col>
        </v-row>
        <v-row v-if="status === 'unauthenticated'">
          <v-col class="d-flex justify-center">
            <v-btn class="mx-4">注册</v-btn>
            <v-btn class="mx-4" color="success" @click="navigateTo('/login')">登录</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  auth: false,
  icon: 'mdi-home',
  index: -1
})

const { status } = useAuth()
</script>

<style scoped>
.v-container {
  background: no-repeat center url("/background1.webp");
}
</style>
