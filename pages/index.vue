<template>
  <v-container class="fill-height" fluid>
    <v-card class="mx-auto" color="transparent" flat width="100%">
      <v-card-text>
        <v-row>
          <v-col>
            <div :class="`text-xl-h1 text-lg-h2 text-md-h3 text-h4 d-flex justify-center text-white`">Welcome to Lawyer Pioneer!</div>
          </v-col>
        </v-row>
        <v-row style="height: 50px;">
          <v-col>
            <v-spacer></v-spacer>
          </v-col>
        </v-row>
        <v-row v-if="status === 'unauthenticated'">
          <v-col class="d-flex justify-center">
            <v-btn class="mx-4" size="large">注册</v-btn>
            <v-btn class="mx-4" size="large" color="success" @click="navigateTo('/login')">登录</v-btn>
          </v-col>
        </v-row>
        <v-row style="height: 50px;">
          <v-col>
            <v-spacer></v-spacer>
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
